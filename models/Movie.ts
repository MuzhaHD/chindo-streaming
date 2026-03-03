import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMovie extends Document {
  title: string;
  slug: string;
  description: string;
  genres: string[];
  thumbnail: string;
  backdrop: string;
  rating: number;
  totalViews: number;
  releaseYear: number;
  type: "movie" | "series";
  status: "ongoing" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const MovieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    genres: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: String,
      required: true,
    },
    backdrop: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    totalViews: {
      type: Number,
      default: 0,
      index: true,
    },
    releaseYear: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["movie", "series"],
      default: "movie",
    },
    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

const Movie: Model<IMovie> =
  mongoose.models.Movie || mongoose.model<IMovie>("Movie", MovieSchema);

export default Movie;