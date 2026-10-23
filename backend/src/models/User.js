import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { ROLES, ROLE_VALUES } from "../constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 20, default: "" },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLE_VALUES, default: ROLES.MANAGER, required: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    // Bumped whenever the password changes. Tokens carry the version they were issued with.
    tokenVersion: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.password;
        delete ret.tokenVersion;
        return ret;
      },
    },
  }
);

userSchema.index({ role: 1, createdAt: -1 });

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, env.BCRYPT_ROUNDS);
  if (!this.isNew) this.tokenVersion += 1;
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
