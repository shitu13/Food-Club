import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { app, stores } from "./boot.mjs";

let server;
let base;
let adminToken;
let managerToken;
let managerId;
const ADMIN = { email: "admin@foodclub.test", password: "Admin12345" };

async function call(method, path, { token, body, headers = {}, raw } = {}) {
  const res = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: { ...(body !== undefined || raw ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json, headers: res.headers };
}
const fieldsOf = (res) => (res.json.errors ?? []).map((e) => e.field);

before(() => new Promise((resolve) => { server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; resolve(); }); }));
after(() => server.close());

describe("basics", () => {
  it("health, root and 404", async () => {
    assert.equal((await call("GET", "/health")).status, 200);
    const root = await fetch(`${base}/`);
    assert.equal(root.status, 200);
    const nf = await call("GET", "/nope");
    assert.equal(nf.status, 404);
    assert.equal(nf.json.success, false);
  });
  it("rejects malformed JSON", async () => {
    const res = await call("POST", "/auth/login", { raw: "{bad" });
    assert.equal(res.status, 400);
  });
  it("sets security headers and hides x-powered-by", async () => {
    const res = await call("GET", "/health");
    assert.ok(res.headers.get("x-content-type-options"));
    assert.equal(res.headers.get("x-powered-by"), null);
  });
});

describe("auth", () => {
  it("validates login input", async () => {
    const res = await call("POST", "/auth/login", { body: { email: "nope", password: "" } });
    assert.equal(res.status, 422);
    assert.deepEqual(fieldsOf(res).sort(), ["email", "password"]);
  });
  it("rejects wrong password and unknown email with the same message", async () => {
    const a = await call("POST", "/auth/login", { body: { email: ADMIN.email, password: "wrong-pass1" } });
    const b = await call("POST", "/auth/login", { body: { email: "ghost@foodclub.test", password: "wrong-pass1" } });
    assert.equal(a.status, 401);
    assert.equal(b.status, 401);
    assert.equal(a.json.message, b.json.message);
  });
  it("logs in the super admin without leaking secrets", async () => {
    const res = await call("POST", "/auth/login", { body: { email: "ADMIN@foodclub.test ", password: ADMIN.password } });
    assert.equal(res.status, 200);
    adminToken = res.json.data.token;
    assert.equal(res.json.data.user.role, "superadmin");
    assert.equal(res.json.data.user.password, undefined);
    assert.equal(res.json.data.user.tokenVersion, undefined);
    assert.ok(res.json.data.user.id);
    assert.ok(res.json.data.user.lastLoginAt);
  });
  it("protects /me", async () => {
    assert.equal((await call("GET", "/auth/me")).status, 401);
    assert.equal((await call("GET", "/auth/me", { token: "garbage" })).status, 401);
    const ok = await call("GET", "/auth/me", { token: adminToken });
    assert.equal(ok.status, 200);
    assert.equal(ok.json.data.user.email, ADMIN.email);
  });
});

describe("manager management", () => {
  it("blocks anonymous access", async () => {
    assert.equal((await call("GET", "/users")).status, 401);
  });
  it("validates new managers", async () => {
    const res = await call("POST", "/users", { token: adminToken, body: { name: "A", email: "bad", password: "short" } });
    assert.equal(res.status, 422);
    assert.deepEqual(fieldsOf(res).sort(), ["email", "name", "password"].sort());
    const weak = await call("POST", "/users", { token: adminToken, body: { name: "Karim", email: "k@foodclub.test", password: "onlyletters" } });
    assert.equal(weak.status, 422);
    assert.deepEqual(fieldsOf(weak), ["password"]);
  });
  it("creates a manager (role cannot be chosen by the client)", async () => {
    const res = await call("POST", "/users", { token: adminToken, body: { name: "Karim Uddin", email: "Karim@FoodClub.test", phone: "+880 1700-000000", password: "Manager123", role: "superadmin" } });
    assert.equal(res.status, 201);
    assert.equal(res.json.data.user.role, "manager");
    assert.equal(res.json.data.user.email, "karim@foodclub.test");
    assert.equal(res.json.data.user.password, undefined);
    managerId = res.json.data.user.id;
    assert.ok(stores.User.docs.find((d) => d.email === "karim@foodclub.test").password.startsWith("$2"));
  });
  it("rejects a duplicate email with a field error", async () => {
    const res = await call("POST", "/users", { token: adminToken, body: { name: "Karim Two", email: "karim@foodclub.test", password: "Manager123" } });
    assert.equal(res.status, 409);
    assert.deepEqual(fieldsOf(res), ["email"]);
  });
  it("manager can log in but cannot use admin endpoints", async () => {
    const login = await call("POST", "/auth/login", { body: { email: "karim@foodclub.test", password: "Manager123" } });
    assert.equal(login.status, 200);
    managerToken = login.json.data.token;
    assert.equal((await call("GET", "/users", { token: managerToken })).status, 403);
    assert.equal((await call("GET", "/stats", { token: managerToken })).status, 403);
    assert.equal((await call("POST", "/dishes", { token: managerToken, body: {} })).status, 403);
  });
  it("lists, searches and filters managers", async () => {
    await call("POST", "/users", { token: adminToken, body: { name: "Rina Akter", email: "rina@foodclub.test", password: "Manager123" } });
    const all = await call("GET", "/users", { token: adminToken });
    assert.equal(all.json.meta.total, 2);
    assert.equal(all.json.data.users[0].email, "rina@foodclub.test");
    assert.ok(all.json.data.users.every((u) => u.role === "manager"));
    const search = await call("GET", "/users?search=KARIM", { token: adminToken });
    assert.equal(search.json.data.users.length, 1);
    const inactive = await call("GET", "/users?isActive=false", { token: adminToken });
    assert.equal(inactive.json.data.users.length, 0);
    const page = await call("GET", "/users?limit=1&page=2", { token: adminToken });
    assert.equal(page.json.meta.totalPages, 2);
    assert.equal(page.json.data.users.length, 1);
    assert.equal((await call("GET", "/users?limit=500", { token: adminToken })).status, 422);
  });
  it("updates a manager and validates the request", async () => {
    const ok = await call("PATCH", `/users/${managerId}`, { token: adminToken, body: { name: "Karim Hossain", role: "superadmin" } });
    assert.equal(ok.status, 200);
    assert.equal(ok.json.data.user.name, "Karim Hossain");
    assert.equal(ok.json.data.user.role, "manager");
    assert.equal((await call("PATCH", `/users/${managerId}`, { token: adminToken, body: {} })).status, 422);
    assert.equal((await call("PATCH", "/users/not-an-id", { token: adminToken, body: { name: "Zed Zed" } })).status, 422);
    assert.equal((await call("PATCH", "/users/aaaaaaaaaaaaaaaaaaaaaaaa", { token: adminToken, body: { name: "Zed Zed" } })).status, 404);
    const adminId = stores.User.docs.find((d) => d.role === "superadmin")._id.toString();
    assert.equal((await call("PATCH", `/users/${adminId}`, { token: adminToken, body: { isActive: false } })).status, 404);
  });
  it("deactivating a manager ends their session and blocks login", async () => {
    assert.equal((await call("PATCH", `/users/${managerId}`, { token: adminToken, body: { isActive: false } })).status, 200);
    assert.equal((await call("GET", "/auth/me", { token: managerToken })).status, 401);
    const login = await call("POST", "/auth/login", { body: { email: "karim@foodclub.test", password: "Manager123" } });
    assert.equal(login.status, 403);
    assert.equal((await call("PATCH", `/users/${managerId}`, { token: adminToken, body: { isActive: true } })).status, 200);
  });
  it("resetting a password ends old sessions immediately", async () => {
    const login = await call("POST", "/auth/login", { body: { email: "karim@foodclub.test", password: "Manager123" } });
    const oldToken = login.json.data.token;
    assert.equal((await call("GET", "/auth/me", { token: oldToken })).status, 200);
    assert.equal((await call("PATCH", `/users/${managerId}/password`, { token: adminToken, body: { password: "short" } })).status, 422);
    assert.equal((await call("PATCH", `/users/${managerId}/password`, { token: adminToken, body: { password: "NewPass456" } })).status, 200);
    assert.equal((await call("GET", "/auth/me", { token: oldToken })).status, 401);
    assert.equal((await call("POST", "/auth/login", { body: { email: "karim@foodclub.test", password: "Manager123" } })).status, 401);
    assert.equal((await call("POST", "/auth/login", { body: { email: "karim@foodclub.test", password: "NewPass456" } })).status, 200);
  });
  it("deletes a manager", async () => {
    assert.equal((await call("DELETE", `/users/${managerId}`, { token: adminToken })).status, 200);
    assert.equal((await call("DELETE", `/users/${managerId}`, { token: adminToken })).status, 404);
  });
});

describe("dishes", () => {
  const dish = (over = {}) => ({
    name: { en: "Chicken Biryani", bn: "চিকেন বিরিয়ানি" },
    description: { en: "Fragrant rice with chicken", bn: "" },
    price: 350,
    category: "rice",
    menus: ["dine-in", "takeout-delivery"],
    image: "https://example.com/biryani.jpg",
    isAvailable: true,
    ...over,
  });
  let firstId;
  let secondId;

  it("only the super admin can create", async () => {
    assert.equal((await call("POST", "/dishes", { body: dish() })).status, 401);
  });
  it("validates dish input with field paths the form can use", async () => {
    const res = await call("POST", "/dishes", { token: adminToken, body: dish({ name: { en: "x" }, price: -5, menus: [], category: "pizza", image: "javascript:alert(1)" }) });
    assert.equal(res.status, 422);
    assert.deepEqual(fieldsOf(res).sort(), ["category", "image", "menus", "name.en", "price"]);
    assert.equal((await call("POST", "/dishes", { token: adminToken, body: dish({ price: 10.999 }) })).status, 422);
    assert.equal((await call("POST", "/dishes", { token: adminToken, body: dish({ price: "350" }) })).status, 422);
  });
  it("creates dishes", async () => {
    const a = await call("POST", "/dishes", { token: adminToken, body: dish() });
    assert.equal(a.status, 201);
    assert.equal(a.json.data.dish.price, 350);
    assert.ok(a.json.data.dish.createdBy);
    firstId = a.json.data.dish.id;
    const b = await call("POST", "/dishes", { token: adminToken, body: dish({ name: { en: "Mango Lassi" }, price: 120.5, category: "drink", menus: ["drinks-cocktails", "drinks-cocktails"], isAvailable: false, image: "" }) });
    assert.equal(b.status, 201);
    assert.deepEqual(b.json.data.dish.menus, ["drinks-cocktails"]);
    assert.equal(b.json.data.dish.name.bn, "");
    secondId = b.json.data.dish.id;
  });
  it("public list hides unavailable dishes and staff-only fields", async () => {
    const res = await call("GET", "/dishes");
    assert.equal(res.status, 200);
    assert.equal(res.json.data.dishes.length, 1);
    assert.equal(res.json.data.dishes[0].createdBy, undefined);
    assert.equal((await call("GET", `/dishes/${secondId}`)).status, 404);
    assert.equal((await call("GET", `/dishes/${firstId}`)).status, 200);
    const ignoresBadToken = await call("GET", "/dishes", { token: "garbage" });
    assert.equal(ignoresBadToken.status, 200);
    const publicTryFilter = await call("GET", "/dishes?isAvailable=false");
    assert.equal(publicTryFilter.json.data.dishes.length, 1);
  });
  it("staff see everything and can filter, search and sort", async () => {
    const all = await call("GET", "/dishes", { token: adminToken });
    assert.equal(all.json.meta.total, 2);
    assert.ok(all.json.data.dishes[0].createdBy);
    assert.equal((await call("GET", "/dishes?isAvailable=false", { token: adminToken })).json.data.dishes.length, 1);
    assert.equal((await call("GET", "/dishes?menu=drinks-cocktails", { token: adminToken })).json.data.dishes[0].name.en, "Mango Lassi");
    assert.equal((await call("GET", "/dishes?category=rice", { token: adminToken })).json.data.dishes.length, 1);
    assert.equal((await call("GET", "/dishes?search=biryani", { token: adminToken })).json.data.dishes.length, 1);
    assert.equal((await call("GET", "/dishes?search=" + encodeURIComponent("বিরিয়ানি"), { token: adminToken })).json.data.dishes.length, 1);
    assert.equal((await call("GET", "/dishes?search=" + encodeURIComponent("(.*"), { token: adminToken })).status, 200);
    const asc = await call("GET", "/dishes?sort=price-asc", { token: adminToken });
    assert.deepEqual(asc.json.data.dishes.map((d) => d.price), [120.5, 350]);
    const page = await call("GET", "/dishes?limit=1&page=2", { token: adminToken });
    assert.equal(page.json.meta.totalPages, 2);
    assert.equal((await call("GET", "/dishes?sort=bogus", { token: adminToken })).status, 422);
  });
  it("partial updates never wipe sibling fields", async () => {
    const price = await call("PATCH", `/dishes/${firstId}`, { token: adminToken, body: { price: 400 } });
    assert.equal(price.status, 200);
    assert.equal(price.json.data.dish.price, 400);
    assert.equal(price.json.data.dish.name.bn, "চিকেন বিরিয়ানি");
    const name = await call("PATCH", `/dishes/${firstId}`, { token: adminToken, body: { name: { en: "Special Biryani" } } });
    assert.equal(name.json.data.dish.name.en, "Special Biryani");
    assert.equal(name.json.data.dish.name.bn, "চিকেন বিরিয়ানি");
    const off = await call("PATCH", `/dishes/${firstId}`, { token: adminToken, body: { isAvailable: false } });
    assert.equal(off.json.data.dish.isAvailable, false);
    assert.equal(off.json.data.dish.menus.length, 2);
    assert.equal((await call("PATCH", `/dishes/${firstId}`, { token: adminToken, body: { category: "pizza" } })).status, 422);
    assert.equal((await call("PATCH", `/dishes/${firstId}`, { token: adminToken, body: {} })).status, 422);
    assert.equal((await call("PATCH", "/dishes/aaaaaaaaaaaaaaaaaaaaaaaa", { token: adminToken, body: { price: 1 } })).status, 404);
  });
  it("deletes dishes", async () => {
    assert.equal((await call("DELETE", `/dishes/${secondId}`, { token: adminToken })).status, 200);
    assert.equal((await call("DELETE", `/dishes/${secondId}`, { token: adminToken })).status, 404);
  });
});

describe("stats, password change, CORS, rate limit", () => {
  it("returns dashboard stats", async () => {
    const res = await call("GET", "/stats", { token: adminToken });
    assert.equal(res.status, 200);
    assert.deepEqual(res.json.data, { dishes: { total: 1, available: 0 }, managers: { total: 1, active: 1 } });
  });
  it("changes the super admin password and ends the old session", async () => {
    const wrong = await call("PATCH", "/auth/password", { token: adminToken, body: { currentPassword: "nope-nope1", newPassword: "Another789" } });
    assert.equal(wrong.status, 400);
    assert.deepEqual(fieldsOf(wrong), ["currentPassword"]);
    const ok = await call("PATCH", "/auth/password", { token: adminToken, body: { currentPassword: ADMIN.password, newPassword: "Another789" } });
    assert.equal(ok.status, 200);
    assert.equal((await call("GET", "/auth/me", { token: adminToken })).status, 401);
    assert.equal((await call("GET", "/auth/me", { token: ok.json.data.token })).status, 200);
    adminToken = ok.json.data.token;
  });
  it("enforces the CORS allow-list", async () => {
    const bad = await call("GET", "/health", { headers: { Origin: "http://evil.example" } });
    assert.equal(bad.status, 403);
    const good = await call("GET", "/health", { headers: { Origin: "http://localhost:5173" } });
    assert.equal(good.headers.get("access-control-allow-origin"), "http://localhost:5173");
  });
  it("rate limits repeated failed logins", async () => {
    let limited = 0;
    for (let i = 0; i < 15 && !limited; i += 1) {
      const res = await call("POST", "/auth/login", { body: { email: "ghost@foodclub.test", password: "wrong-pass1" } });
      if (res.status === 429) limited = i + 1;
    }
    assert.ok(limited > 0, "expected a 429");
  });
});
