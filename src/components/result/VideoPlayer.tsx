'use client';

import { useState } from 'react';
import { Download, Copy, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface VideoPlayerProps {
  videoUrl: string;
  variantName: string;
  hasWatermark: boolean;
  onDownload: () => void;
}

export const VideoPlayer = ({
  videoUrl,
  variantName,
  hasWatermark,
  onDownload,
}: VideoPlayerProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'تیزر اینستاگرام من',
        text: 'تیزر من با TeaseAI ساخته شده!',
        url: videoUrl,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative rounded-2xl overflow-hidden bg-black card-shadow">
        <video
          src={videoUrl}
          controls
          autoPlay
          muted
          loop
          className="w-full aspect-[9/16] max-h-[70vh] object-contain"
        />
        {hasWatermark && (
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg text-xs text-white/70">
            🎬 TeaseAI
          </div>
        )}
        <div className="absolute top-4 left-4 bg-indigo-600/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-medium">
          {variantName}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={onDownload} icon={Download}>
          دانلود MP4
        </Button>
        <Button variant="outline" onClick={handleCopy} icon={copied ? Check : Copy}>
          {copied ? 'کپی شد!' : 'کپی لینک'}
        </Button>
        <Button variant="secondary" onClick={handleShare} icon={Share2}>
          اشتراک‌گذاری
        </Button>
      </div>
    </div>
  );
};