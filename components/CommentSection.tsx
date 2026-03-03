"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, Send, ThumbsUp, ThumbsDown, Reply, MoreVertical, Trash2 } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import Button from "./ui/Button";
import Input from "./ui/Input";
import EmptyState from "./ui/EmptyState";

interface Comment {
  _id: string;
  userId: string;
  content: string;
  likesCount: number;
  likedBy: string[];
  createdAt: string;
  parentId?: string;
  user?: {
    name: string;
    image?: string;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  movieId: string;
  episodeId?: string;
}

export default function CommentSection({ movieId, episodeId }: CommentSectionProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = async (pageNum: number = 1) => {
    try {
      const res = await fetch(
        `/api/comments?movieId=${movieId}&page=${pageNum}&limit=10`
      );
      const data = await res.json();
      
      if (data.ok) {
        if (pageNum === 1) {
          setComments(data.data);
        } else {
          setComments((prev) => [...prev, ...data.data]);
        }
        setHasMore(data.meta.page < data.meta.totalPages);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [movieId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || status !== "authenticated") return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId,
          episodeId,
          content: newComment,
        }),
      });

      const data = await res.json();
      
      if (data.ok) {
        setNewComment("");
        fetchComments(1);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || status !== "authenticated") return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId,
          episodeId,
          parentId,
          content: replyContent,
        }),
      });

      const data = await res.json();
      
      if (data.ok) {
        setReplyContent("");
        setReplyingTo(null);
        fetchComments(1);
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleLike = async (commentId: string) => {
    if (status !== "authenticated") return;

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });
      const data = await res.json();
      
      if (data.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? { ...c, likesCount: data.data.likesCount, isLiked: data.data.isLiked }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Yakin ingin menghapus komentar ini?")) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        fetchComments(1);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const isAdmin = session?.user?.role === "admin";
  const currentUserId = session?.user?.id;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        Komentar ({comments.length})
      </h3>

      {/* Comment Form */}
      {status === "authenticated" ? (
        <form onSubmit={handleSubmitComment} className="flex gap-3">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent-gold flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-background">
                {session?.user?.name?.[0] || "U"}
              </span>
            </div>
          )}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar..."
              className="w-full px-4 py-3 bg-card border border-gray-700 rounded-lg text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-gold resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <Button type="submit" disabled={!newComment.trim()} className="gap-2">
                <Send className="w-4 h-4" />
                Kirim
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-card rounded-lg text-center">
          <p className="text-foreground-muted">
            <a href="/login" className="text-accent-gold hover:underline">Login</a> untuk menulis komentar
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-card animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-card animate-pulse rounded" />
                <div className="h-16 w-full bg-card animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <EmptyState
          title="Belum ada komentar"
          description="Jadilah yang pertama menulis komentar!"
          icon={<MessageCircle className="w-8 h-8 text-foreground-muted" />}
        />
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              {comment.user?.image ? (
                <img
                  src={comment.user.image}
                  alt={comment.user.name || "User"}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent-gold flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-background">
                    {comment.user?.name?.[0] || "U"}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">
                    {comment.user?.name || "User"}
                  </span>
                  <span className="text-xs text-foreground-muted">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                  {(currentUserId === comment.userId || isAdmin) && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>

                <p className="text-foreground mb-2">{comment.content}</p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(comment._id)}
                    className={cn(
                      "flex items-center gap-1 text-sm transition-colors",
                      comment.likedBy?.includes(currentUserId || "")
                        ? "text-accent-gold"
                        : "text-foreground-muted hover:text-foreground"
                    )}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {comment.likesCount > 0 && comment.likesCount}
                  </button>

                  {status === "authenticated" && (
                    <button
                      onClick={() =>
                        setReplyingTo(replyingTo === comment._id ? null : comment._id)
                      }
                      className="flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      Balas
                    </button>
                  )}
                </div>

                {/* Reply Form */}
                {replyingTo === comment._id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Tulis balasan..."
                      className="flex-1 px-3 py-2 bg-card border border-gray-700 rounded-lg text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(comment._id)}
                      disabled={!replyContent.trim()}
                    >
                      Kirim
                    </Button>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-700 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="flex gap-2">
                        {reply.user?.image ? (
                          <img
                            src={reply.user.image}
                            alt={reply.user.name || "User"}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-foreground">
                              {reply.user?.name?.[0] || "U"}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {reply.user?.name || "User"}
                            </span>
                            <span className="text-xs text-foreground-muted">
                              {formatRelativeTime(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchComments(nextPage);
                }}
              >
                Muat lebih banyak
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}