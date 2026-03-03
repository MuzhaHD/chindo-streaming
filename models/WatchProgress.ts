import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWatchProgress extends Document {
  userId: mongoose.Types.ObjectId;
  movieId: mongoose.Types.ObjectId;
  episodeId: mongoose.Types.ObjectId;
  currentTime: number;
  duration: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WatchProgressSchema = new Schema<IWatchProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true,
    },
    episodeId: {
      type: Schema.Types.ObjectId,
      ref: "Episode",
      required: true,
      index: true,
    },
    currentTime: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
WatchProgressSchema.index({ userId: 1, updatedAt: -1 });
WatchProgressSchema.index({ userId: 1, movieId: 1, episodeId: 1 }, { unique: true });

const WatchProgress: Model<IWatchProgress> =
  mongoose.models.WatchProgress ||
  mongoose.model<IWatchProgress>("WatchProgress", WatchProgressSchema);

export default WatchProgress;