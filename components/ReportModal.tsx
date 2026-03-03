"use client";

import { useState } from "react";
import { Flag, X, Check, ExternalLink } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { generateReportTemplate } from "@/lib/utils";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
  slug: string;
  episodeNumber?: number;
  episodeId?: string;
  serverKey: string;
  serverLabel: string;
  telegramGroupUrl: string;
  siteUrl: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  movieTitle,
  slug,
  episodeNumber,
  episodeId,
  serverKey,
  serverLabel,
  telegramGroupUrl,
  siteUrl,
}: ReportModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyReport = async () => {
    const template = generateReportTemplate({
      title: movieTitle,
      slug,
      episodeNumber,
      episodeId,
      serverKey,
      serverLabel,
      siteUrl,
    });

    try {
      await navigator.clipboard.writeText(template);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleOpenTelegram = () => {
    window.open(telegramGroupUrl, "_blank");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lapor Masalah"
      className="max-w-sm"
    >
      <div className="space-y-4">
        <p className="text-foreground-muted text-sm">
          Untuk melaporkan kendala pada film ini,silahkan langsung lapor di
          Telegram group CHINDO.
        </p>

        <div className="p-3 bg-gray-800 rounded-lg">
          <p className="text-xs text-foreground-muted">
            Template laporan akan disalin otomatis agar memudahkan Anda
            paste di Telegram.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleCopyReport}
            className="flex-1 gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Tersalin
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Salin Template
              </>
            )}
          </Button>
          
          <Button
            onClick={handleOpenTelegram}
            variant="secondary"
            className="flex-1 gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Buka Telegram
          </Button>
        </div>

        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full"
        >
          Tutup
        </Button>
      </div>
    </Modal>
  );
}