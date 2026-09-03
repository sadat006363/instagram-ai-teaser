import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * دانلود یک تصویر از URL و ذخیره در پوشه Temp
 * @param url - آدرس تصویر
 * @param retries - تعداد تلاش مجدد (پیش‌فرض ۳)
 * @returns مسیر فایل محلی یا null در صورت خطا
 */
export async function downloadImage(url: string, retries: number = 3): Promise<string | null> {
  if (!url || url.startsWith('data:')) {
    return url; // اگر already base64 است
  }

  // اگر فایل محلی است، همان را برگردان
  if (url.startsWith('file://') || url.startsWith('/') || url.includes(':\\')) {
    return url;
  }

  const tempDir = os.tmpdir();
  const fileName = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(url) || '.jpg'}`;
  const localPath = path.join(tempDir, fileName);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🐞 [ImageDownloader] دانلود تصویر (تلاش ${attempt}/${retries}): ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(10000), // ۱۰ ثانیه تایم‌اوت
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(localPath, buffer);
      
      console.log(`🐞 [ImageDownloader] ✅ تصویر ذخیره شد: ${localPath}`);
      return localPath;
    } catch (error) {
      console.warn(`🐞 [ImageDownloader] ❌ خطا در تلاش ${attempt}:`, error);
      if (attempt === retries) {
        // در صورت شکست نهایی، fallback به تصویر placeholder
        return null;
      }
      // تاخیر قبل از تلاش مجدد (افزایشی)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return null;
}

/**
 * تبدیل یک آرایه از پست‌ها با تصاویر ریموت به مسیرهای محلی
 * @param posts - آرایه پست‌ها
 * @returns پست‌ها با imageUrl محلی
 */
export async function downloadAllPostImages(posts: any[]): Promise<any[]> {
  const results = await Promise.all(
    posts.map(async (post) => {
      if (post.imageUrl) {
        const localPath = await downloadImage(post.imageUrl);
        return {
          ...post,
          imageUrl: localPath || post.imageUrl, // اگر دانلود نشد، خودش را نگه دار (با fallback در کامپوننت)
        };
      }
      return post;
    })
  );
  return results;
}