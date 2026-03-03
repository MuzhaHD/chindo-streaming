import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISection extends Document {
  title: string;
  type: "hero" | "carousel" | "feed" | "genrePills" | "custom";
  value: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema = new Schema<ISection>(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["hero", "carousel", "feed", "genrePills", "custom"],
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

SectionSchema.index({ order: 1 });

const Section: Model<ISection> =
  mongoose.models.Section || mongoose.model<ISection>("Section", SectionSchema);

export default Section;