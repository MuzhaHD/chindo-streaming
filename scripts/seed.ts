import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/chindo";

// Define schemas inline for seed script
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, default: null },
  googleId: { type: String, default: null },
  image: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  genres: { type: [String], default: [] },
  thumbnail: { type: String, required: true },
  backdrop: { type: String, required: true },
  rating: { type: Number, default: 0, min: 0, max: 10 },
  totalViews: { type: Number, default: 0 },
  releaseYear: { type: Number, required: true },
  type: { type: String, enum: ["movie", "series"], default: "movie" },
  status: { type: String, enum: ["ongoing", "completed"], default: "completed" },
}, { timestamps: true });

const episodeSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  episodeNumber: { type: Number, required: true },
  title: { type: String, required: true },
  duration: { type: Number, default: 0 },
  videoSources: [{
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["mp4", "hls", "iframe"], required: true },
    url: { type: String, required: true },
  }],
}, { timestamps: true });

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  value: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Models
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Movie = mongoose.models.Movie || mongoose.model("Movie", movieSchema);
const Episode = mongoose.models.Episode || mongoose.model("Episode", episodeSchema);
const Section = mongoose.models.Section || mongoose.model("Section", sectionSchema);

// Sample data
const sampleMovies = [
  {
    title: "Celestial Emperor",
    slug: "celestial-emperor",
    description: "Di dunia cultivate, ada seorang pemimpin tertinggi yang menguasai seluruh alam semesta. Kisah perjalanan seorang petani biasa menjadi kaisar surgawi.",
    genres: ["Action", "Fantasy", "Adventure"],
    thumbnail: "https://picsum.photos/seed/movie1/400/600",
    backdrop: "https://picsum.photos/seed/movie1bg/1920/1080",
    rating: 9.2,
    totalViews: 1250000,
    releaseYear: 2024,
    type: "series",
    status: "ongoing",
  },
  {
    title: "Dragon Soul",
    slug: "dragon-soul",
    description: "Naga legendaris terbangun dari tidur panjangnya. Seorang pendekar muda harus menemukan jalan untuk menyelamatkan dunianya.",
    genres: ["Action", "Fantasy", "Supernatural"],
    thumbnail: "https://picsum.photos/seed/movie2/400/600",
    backdrop: "https://picsum.photos/seed/movie2bg/1920/1080",
    rating: 8.8,
    totalViews: 980000,
    releaseYear: 2024,
    type: "series",
    status: "completed",
  },
  {
    title: "Immortal Realm",
    slug: "immortal-realm",
    description: "Di alam keabadian, para immortality berjuang untuk kekuasaan tertinggi. Siapa yang akan menjadi yang terkuat?",
    genres: ["Fantasy", "Action", "Drama"],
    thumbnail: "https://picsum.photos/seed/movie3/400/600",
    backdrop: "https://picsum.photos/seed/movie3bg/1920/1080",
    rating: 9.0,
    totalViews: 850000,
    releaseYear: 2023,
    type: "series",
    status: "completed",
  },
  {
    title: "Sword Master",
    slug: "sword-master",
    description: "Seorang MASTER PEDANG menciptakan jalan baru dalam seni pedang. Kisah epik seorang jenius yang melampaui semua harapan.",
    genres: ["Action", "Adventure", "Comedy"],
    thumbnail: "https://picsum.photos/seed/movie4/400/600",
    backdrop: "https://picsum.photos/seed/movie4bg/1920/1080",
    rating: 8.5,
    totalViews: 720000,
    releaseYear: 2024,
    type: "series",
    status: "ongoing",
  },
  {
    title: "Battle Through Heavens",
    slug: "battle-through-heavens",
    description: "Pertempuran melintasi langit-langit. Seorang muda dengan bakat luar biasa melawan seluruh dunia untuk masa depan.",
    genres: ["Action", "Fantasy", "Adventure"],
    thumbnail: "https://picsum.photos/seed/movie5/400/600",
    backdrop: "https://picsum.photos/seed/movie5bg/1920/1080",
    rating: 9.3,
    totalViews: 1500000,
    releaseYear: 2024,
    type: "series",
    status: "ongoing",
  },
  {
    title: "Spirit Hunter",
    slug: "spirit-hunter",
    description: "Pemburu roh berbahaya mengancam kerajaan. Seorang pemburu muda memulai perjalanan untuk menyelidiki kebenaran.",
    genres: ["Supernatural", "Action", "Thriller"],
    thumbnail: "https://picsum.photos/seed/movie6/400/600",
    backdrop: "https://picsum.photos/seed/movie6bg/1920/1080",
    rating: 8.7,
    totalViews: 680000,
    releaseYear: 2023,
    type: "series",
    status: "completed",
  },
  {
    title: "Love in Cultivation",
    slug: "love-in-cultivation",
    description: "Di tengah-tengah kultivasi yang keras, cinta tumbuh di antara dua hati yang saling bertentangan.",
    genres: ["Romance", "Fantasy", "Drama"],
    thumbnail: "https://picsum.photos/seed/movie7/400/600",
    backdrop: "https://picsum.photos/seed/movie7bg/1920/1080",
    rating: 8.3,
    totalViews: 550000,
    releaseYear: 2024,
    type: "series",
    status: "ongoing",
  },
  {
    title: "Martial Peak",
    slug: "martial-peak",
    description: "Puncak martil menunggu. Siapa yang akan mencapai puncak? Kisah tentang perjalanan panjang seorang pendekar.",
    genres: ["Action", "Fantasy", "Adventure"],
    thumbnail: "https://picsum.photos/seed/movie8/400/600",
    backdrop: "https://picsum.photos/seed/movie8bg/1920/1080",
    rating: 9.1,
    totalViews: 1100000,
    releaseYear: 2024,
    type: "series",
    status: "ongoing",
  },
  {
    title: "Legend of Luohan",
    slug: "legend-of-luohan",
    description: "Legenda seorang Luohan yang luar biasa. Kisah inspiratif tentang seorangCX yang berjuang untuk keadilan.",
    genres: ["Action", "Adventure", "Comedy"],
    thumbnail: "https://picsum.photos/seed/movie9/400/600",
    backdrop: "https://picsum.photos/seed/movie9bg/1920/1080",
    rating: 8.6,
    totalViews: 620000,
    releaseYear: 2023,
    type: "movie",
    status: "completed",
  },
  {
    title: "Shadow Cultivator",
    slug: "shadow-cultivator",
    description: "Cultivator bayangan beroperasi di kegelapan. Seorang muda dengan kekuatan misterius mengungkap konspirasi besar.",
    genres: ["Action", "Thriller", "Supernatural"],
    thumbnail: "https://picsum.photos/seed/movie10/400/600",
    backdrop: "https://picsum.photos/seed/movie10bg/1920/1080",
    rating: 8.9,
    totalViews: 780000,
    releaseYear: 2024,
    type: "series",
    status: "ongoing",
  },
];

// Video sources (using sample video URLs)
const sampleVideoSources = [
  { key: "p2p", label: "P2P", type: "mp4" as const, url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { key: "turbovip", label: "TURBOVIP", type: "mp4" as const, url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { key: "backup", label: "BACKUP", type: "mp4" as const, url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
];

const sampleSections = [
  { title: "Hero", type: "hero", value: "topViewed", order: 0, isActive: true },
  { title: "Genre", type: "genrePills", value: "genres", order: 1, isActive: true },
  { title: "Paling Populer", type: "carousel", value: "popular", order: 2, isActive: true },
  { title: "Episode Terbaru", type: "feed", value: "newEpisodes", order: 3, isActive: true },
  { title: "Movie Marathon", type: "carousel", value: "movieMarathon", order: 4, isActive: true },
  { title: "Donghua Baru", type: "carousel", value: "newDonghua", order: 5, isActive: true },
];

async function seed() {
  console.log("🌱 Starting seed...");

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Episode.deleteMany({});
    await Section.deleteMany({});
    console.log("🗑️ Cleared existing data");

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await User.create({
      name: "Admin CHINDO",
      email: "admin@chindo.local",
      passwordHash: hashedPassword,
      role: "admin",
    });
    console.log("✅ Created admin user:", adminUser.email);

    // Create movies
    const createdMovies = await Movie.insertMany(sampleMovies);
    console.log("✅ Created", createdMovies.length, "movies");

    // Create episodes for each movie (3 episodes per movie)
    const episodes = [];
    for (const movie of createdMovies) {
      for (let i = 1; i <= 3; i++) {
        episodes.push({
          movieId: movie._id,
          episodeNumber: i,
          title: `Episode ${i}`,
          duration: Math.floor(Math.random() * 3600) + 1800, // 30-90 minutes
          videoSources: sampleVideoSources,
        });
      }
    }
    await Episode.insertMany(episodes);
    console.log("✅ Created", episodes.length, "episodes");

    // Create sections
    await Section.insertMany(sampleSections);
    console.log("✅ Created sections");

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📋 Admin credentials:");
    console.log("   Email: admin@chindo.local");
    console.log("   Password: admin123");
    console.log("\n💡 You can now run: npm run dev");

  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

seed();