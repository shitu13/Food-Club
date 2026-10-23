import mongoose from "mongoose";

// A "menu item" in the website's Menu dropdown, e.g. "Dine-In" or "Drinks & Cocktails".
// The super admin creates these. Dishes belong to one or more of them.
const menuSectionSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
      bn: { type: String, trim: true, maxlength: 60, default: "" },
    },
    description: {
      en: { type: String, trim: true, maxlength: 200, default: "" },
      bn: { type: String, trim: true, maxlength: 200, default: "" },
    },
    // Used in the page address (/menu/<slug>). Created from the English name and kept stable afterwards.
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 70 },
    // Smaller numbers appear first in the navbar.
    position: { type: Number, default: 0, min: 0, max: 9999 },
    isActive: { type: Boolean, default: true, index: true },
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

export default mongoose.model("MenuSection", menuSectionSchema);
