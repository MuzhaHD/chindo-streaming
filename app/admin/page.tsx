"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Film, Edit, Trash2, Eye, BarChart3 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { use } from "react";

interface Movie {
  _id: string;
  title: string;
  slug: string;
  totalViews: number;
  rating: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    genres: "",
    thumbnail: "",
    backdrop: "",
    releaseYear: new Date().getFullYear(),
    type: "movie",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    } else if (status === "authenticated" && session?.user?.role === "admin") {
      fetchMovies();
    }
  }, [status, session, router]);

  const fetchMovies = async () => {
    try {
      const res = await fetch("/api/movies?limit=100");
      const data = await res.json();
      if (data.ok) {
        setMovies(data.data);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          genres: formData.genres.split(",").map((g) => g.trim()),
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setShowAddMovie(false);
        fetchMovies();
        setFormData({
          title: "",
          slug: "",
          description: "",
          genres: "",
          thumbnail: "",
          backdrop: "",
          releaseYear: new Date().getFullYear(),
          type: "movie",
        });
      } else {
        alert(data.error?.message || "Gagal menambahkan film");
      }
    } catch (error) {
      console.error("Error adding movie:", error);
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm("Yakin ingin menghapus film ini?")) return;

    try {
      const res = await fetch(`/api/movies/${movieId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchMovies();
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  if (session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <Button onClick={() => setShowAddMovie(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Film
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <Film className="w-10 h-10 text-accent-gold" />
              <div>
                <p className="text-2xl font-bold text-foreground">{movies.length}</p>
                <p className="text-foreground-muted">Total Film</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <Eye className="w-10 h-10 text-accent-gold" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {movies.reduce((sum, m) => sum + m.totalViews, 0).toLocaleString()}
                </p>
                <p className="text-foreground-muted">Total Views</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-10 h-10 text-accent-gold" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {(movies.reduce((sum, m) => sum + m.rating, 0) / movies.length || 0).toFixed(1)}
                </p>
                <p className="text-foreground-muted">Rata-rata Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Movies Table */}
        <div className="bg-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Judul</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Slug</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Views</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Rating</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {movies.map((movie) => (
                  <tr key={movie._id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-foreground">{movie.title}</td>
                    <td className="px-4 py-3 text-foreground-muted text-sm">{movie.slug}</td>
                    <td className="px-4 py-3 text-foreground">{movie.totalViews.toLocaleString()}</td>
                    <td className="px-4 py-3 text-foreground">{movie.rating.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteMovie(movie._id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Movie Modal */}
      <Modal
        isOpen={showAddMovie}
        onClose={() => setShowAddMovie(false)}
        title="Tambah Film Baru"
        className="max-w-2xl"
      >
        <form onSubmit={handleAddMovie} className="space-y-4">
          <Input
            label="Judul"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="contoh-judul-film"
            required
          />
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1.5">
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-card border border-gray-700 rounded-lg text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-gold"
              rows={4}
              required
            />
          </div>
          <Input
            label="Genres (pisahkan dengan koma)"
            value={formData.genres}
            onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
            placeholder="Action, Adventure, Fantasy"
          />
          <Input
            label="Thumbnail URL"
            value={formData.thumbnail}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            required
          />
          <Input
            label="Backdrop URL"
            value={formData.backdrop}
            onChange={(e) => setFormData({ ...formData, backdrop: e.target.value })}
            required
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                Tahun Rilis
              </label>
              <input
                type="number"
                value={formData.releaseYear}
                onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-card border border-gray-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-gold"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                Tipe
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-card border border-gray-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-gold"
              >
                <option value="movie">Movie</option>
                <option value="series">Series</option>
              </select>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Tambah Film
          </Button>
        </form>
      </Modal>
    </div>
  );
}