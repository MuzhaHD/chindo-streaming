import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}j ${minutes}m`;
  }
  return `${minutes}m ${secs}d`;
}

export function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}JT`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}RB`;
  }
  return views.toString();
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Baru saja";
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} menit lalu`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} jam lalu`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} hari lalu`;
  }
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function generateReportTemplate(params: {
  title: string;
  slug: string;
  episodeNumber?: number;
  episodeId?: string;
  serverKey: string;
  serverLabel: string;
  siteUrl: string;
}): string {
  const { title, slug, episodeNumber, episodeId, serverKey, serverLabel, siteUrl } = params;
  
  let url = `${siteUrl}/watch/${slug}`;
  if (episodeId) {
    url += `?episode=${episodeId}`;
  }

  const episodeInfo = episodeNumber ? `Episode ${episodeNumber}` : "Film";

  return `🔴 LAPORAN MASALAH CHINDO

📌 Judul: ${title}
${episodeInfo}
🖥️ Server: ${serverLabel} (${serverKey})
🔗 URL: ${url}
⏰ Timestamp: ${new Date().toISOString()}

Mohon ditindaklanjuti. Terima kasih!`;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Terjadi kesalahan yang tidak terduga";
}