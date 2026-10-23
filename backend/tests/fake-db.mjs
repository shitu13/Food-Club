// Test-only stand-in for MongoDB: Mongoose itself (casting, validators, hooks) runs for real,
// only the storage collection is replaced with this in-memory implementation.
import mongoose from "mongoose";

const isOid = (v) => v && typeof v === "object" && v._bsontype === "ObjectId";
const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

function setPath(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  for (const key of keys.slice(0, -1)) {
    if (cur[key] == null || typeof cur[key] !== "object") cur[key] = {};
    cur = cur[key];
  }
  cur[keys[keys.length - 1]] = value;
}

function clone(v) {
  if (isOid(v) || v instanceof RegExp) return v;
  if (v instanceof Date) return new Date(v.getTime());
  if (Array.isArray(v)) return v.map(clone);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clone(x)]));
  return v;
}

const valueEq = (a, b) => (isOid(a) || isOid(b) ? String(a) === String(b) : a instanceof Date && b instanceof Date ? a.getTime() === b.getTime() : a === b);

function matchesCondition(actual, cond) {
  if (cond instanceof RegExp) {
    return Array.isArray(actual) ? actual.some((v) => cond.test(v)) : typeof actual === "string" && cond.test(actual);
  }
  if (cond && typeof cond === "object" && !isOid(cond) && !(cond instanceof Date) && Object.keys(cond).some((k) => k.startsWith("$"))) {
    return Object.entries(cond).every(([op, val]) => {
      if (op === "$in") return val.some((x) => matchesCondition(actual, x));
      if (op === "$ne") return !valueEq(actual, val);
      if (op === "$eq") return matchesCondition(actual, val);
      throw new Error(`fake-db: unsupported operator ${op}`);
    });
  }
  if (Array.isArray(actual)) return actual.some((v) => valueEq(v, cond));
  return valueEq(actual, cond);
}

function matches(doc, filter) {
  return Object.entries(filter).every(([key, value]) => {
    if (key === "$or") return value.some((f) => matches(doc, f));
    if (key === "$and") return value.every((f) => matches(doc, f));
    return matchesCondition(getPath(doc, key), value);
  });
}

function project(doc, projection) {
  if (!projection || Object.keys(projection).length === 0) return clone(doc);
  const out = clone(doc);
  const entries = Object.entries(projection);
  const inclusive = entries.some(([k, v]) => v && k !== "_id");
  if (inclusive) {
    const kept = { _id: out._id };
    for (const [k, v] of entries) if (v && k !== "_id") { const x = getPath(out, k); if (x !== undefined) setPath(kept, k, x); }
    return kept;
  }
  for (const [k, v] of entries) if (!v) { const keys = k.split("."); const last = keys.pop(); const parent = keys.reduce((o, kk) => o?.[kk], out); if (parent) delete parent[last]; }
  return out;
}

function compare(a, b) {
  const norm = (x) => (x instanceof Date ? x.getTime() : isOid(x) ? String(x) : x);
  const [x, y] = [norm(a), norm(b)];
  if (x === y) return 0;
  if (x === undefined) return -1;
  if (y === undefined) return 1;
  return x < y ? -1 : 1;
}

function applyUpdate(doc, update) {
  const { $set, $unset, $inc, $setOnInsert, ...rest } = update;
  if (Object.keys(rest).length > 0) throw new Error(`fake-db: unsupported update ${Object.keys(rest)}`);
  for (const [k, v] of Object.entries($set ?? {})) setPath(doc, k, clone(v));
  for (const k of Object.keys($unset ?? {})) { const keys = k.split("."); const last = keys.pop(); const parent = keys.reduce((o, kk) => o?.[kk], doc); if (parent) delete parent[last]; }
  for (const [k, v] of Object.entries($inc ?? {})) setPath(doc, k, (getPath(doc, k) ?? 0) + v);
}

export class FakeCollection {
  constructor(uniqueFields = []) {
    this.docs = [];
    this.uniqueFields = uniqueFields;
  }

  checkUnique(candidate, ignoreId) {
    for (const field of this.uniqueFields) {
      const clash = this.docs.find((d) => !valueEq(d._id, ignoreId) && valueEq(getPath(d, field), getPath(candidate, field)));
      if (clash) {
        const error = new Error(`E11000 duplicate key error collection: dup key: { ${field}: "${getPath(candidate, field)}" }`);
        error.code = 11000;
        error.keyPattern = { [field]: 1 };
        error.keyValue = { [field]: getPath(candidate, field) };
        throw error;
      }
    }
  }

  async insertOne(doc) {
    this.checkUnique(doc, undefined);
    this.docs.push(clone(doc));
    return { acknowledged: true, insertedId: doc._id };
  }

  sorted(filter, options = {}) {
    let list = this.docs.filter((d) => matches(d, filter));
    const sort = options.sort;
    if (sort) {
      const keys = sort instanceof Map ? [...sort.entries()] : Object.entries(sort);
      list = [...list].sort((a, b) => {
        for (const [key, dir] of keys) {
          const c = compare(getPath(a, key), getPath(b, key));
          if (c !== 0) return c * (dir === -1 || dir === "desc" ? -1 : 1);
        }
        return 0;
      });
    }
    return list;
  }

  async find(filter, options = {}) {
    let list = this.sorted(filter, options);
    if (options.skip) list = list.slice(options.skip);
    if (options.limit) list = list.slice(0, options.limit);
    const result = list.map((d) => project(d, options.projection));
    return { toArray: async () => result };
  }

  async findOne(filter, options = {}) {
    const found = this.sorted(filter, options)[0];
    return found ? project(found, options.projection) : null;
  }

  async countDocuments(filter) {
    return this.docs.filter((d) => matches(d, filter)).length;
  }

  async findOneAndUpdate(filter, update, options = {}) {
    const found = this.sorted(filter, options)[0];
    if (!found) return null;
    const before = clone(found);
    const draft = clone(found);
    applyUpdate(draft, update);
    this.checkUnique(draft, found._id);
    Object.keys(found).forEach((k) => delete found[k]);
    Object.assign(found, draft);
    return project(options.returnDocument === "after" ? found : before, options.projection);
  }

  async updateOne(filter, update) {
    const found = this.sorted(filter)[0];
    if (!found) return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
    const draft = clone(found);
    applyUpdate(draft, update);
    this.checkUnique(draft, found._id);
    Object.keys(found).forEach((k) => delete found[k]);
    Object.assign(found, draft);
    return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
  }

  async findOneAndDelete(filter, options = {}) {
    const found = this.sorted(filter, options)[0];
    if (!found) return null;
    this.docs = this.docs.filter((d) => d !== found);
    return project(found, options.projection);
  }

  async deleteOne(filter) {
    const found = this.sorted(filter)[0];
    if (found) this.docs = this.docs.filter((d) => d !== found);
    return { acknowledged: true, deletedCount: found ? 1 : 0 };
  }

  async createIndex() {}
  async createIndexes() {}
}

export function installFakeDb(models) {
  const stores = {};
  for (const [name, Model] of Object.entries(models)) {
    const fake = new FakeCollection(name === "User" ? ["email"] : []);
    Model.collection.collection = fake;
    Model.collection.buffer = false;
    stores[name] = fake;
  }
  mongoose.connection._readyState = 1;
  return stores;
}
