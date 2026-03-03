import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWatchlist extends Document {
  userId: mongoose.Types.ObjectId;
  movieId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const WatchlistSchema = new Schema<IWatchlist>(
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
  },
  {
    timestamps: true,
  }
);

// Compound unique index
WatchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const Watchlist: Model<IWatchlist> =
  mongoose.models.Watchlist ||
  mongoose.model<IWatchlist>("Watchlist", WatchlistSchema);

export default Watchlist;