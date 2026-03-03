import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVideoSource {
  key: string;
  label: string;
  type: "mp4" | "hls" | "iframe";
  url: string;
}

export interface IEpisode extends Document {
  movieId: mongoose.Types.ObjectId;
  episodeNumber: number;
  title: string;
  duration: number;
  videoSources: IVideoSource[];
  createdAt: Date;
  updatedAt: Date;
}

const VideoSourceSchema = new Schema<IVideoSource>(
  {
    key: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["mp4", "hls", "iframe"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const EpisodeSchema = new Schema<IEpisode>(
  {
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true,
    },
    episodeNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    videoSources: {
      type: [VideoSourceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index
EpisodeSchema.index({ movieId: 1, episodeNumber: 1 }, { unique: true });

const Episode: Model<IEpisode> =
  mongoose.models.Episode || mongoose.model<IEpisode>("Episode", EpisodeSchema);

export default Episode;