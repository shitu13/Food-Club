import mongoose from "mongoose";
import { DISH_CATEGORIES } from "../constants/dish.js";

const dishSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, trim: true, maxlength: 100 },
      bn: { type: String, trim: true, maxlength: 100, default: "" },
    },
    description: {
      en: { type: String, trim: true, maxlength: 500, default: "" },
      bn: { type: String, trim: true, maxlength: 500, default: "" },
    },
    price: { type: Number, required: true, min: 0, max: 1_000_000 },
    category: { type: String, enum: DISH_CATEGORIES, required: true, index: true },
    // The menu items (see MenuSection) this dish is listed under.
    sections: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "MenuSection" }],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Select at least one menu item.",
      },
    },
    image: { type: String, trim: true, maxlength: 500, default: "" },
    isAvailable: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

dishSchema.index({ sections: 1, isAvailable: 1 });

export default mongoose.model("Dish", dishSchema);
