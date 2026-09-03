import path from 'path';
import fs from 'fs';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ScenePlan } from '@/lib/scene/scene-plan';

const execAsync = promisify(exec);

export interface RenderOptions {
  posts: any[];
  plan: ScenePlan;
  outputPath?: string;
}

export class VideoRenderer {
  static async renderTeaser({ posts, plan, outputPath }: RenderOptions): Promise<string> {
    console.log(`🐞 [Renderer] شروع رندر ویدیو با قالب ${plan.templateId}...`);

    try {
      // ۱. آماده‌سازی داده‌ها برای قالب
      const templateProps = {
        posts,
        scenes: plan.scenes.map(s => ({
          postIndex: s.assetIndex,
          duration: s.duration,
          caption: s.text,
          animation: s.animation || 'fade',
        })),
        hook: plan.scenes.find(s => s.type === 'hook')?.text || '',
        cta: plan.scenes.find(s => s.type === 'cta')?.text || '',
        brandHandle: 'zuck',
        colorPalette: [plan.colorVariant, '#8b5cf6', '#ec4899'],
      };

      // ۲. تعیین مسیر خروجی
      const outputFile = outputPath || path.join(os.tmpdir(), `teaser-${Date.now()}.mp4`);
      console.log(`🐞 [Renderer] مسیر خروجی: ${outputFile}`);

      // ۳. ایجاد فایل JSON موقت برای props
      const propsFile = path.join(os.tmpdir(), `props-${Date.now()}.json`);
      fs.writeFileSync(propsFile, JSON.stringify(templateProps, null, 2));
      console.log(`🐞 [Renderer] فایل props ساخته شد: ${propsFile}`);

      // ۴. پیدا کردن مسیر مرورگر نصب‌شده
      const browserPath = this.findBrowserPath();
      console.log(`🐞 [Renderer] مرورگر پیدا شد: ${browserPath || 'پیدا نشد (استفاده از پیش‌فرض)'}`);

      // ۵. ساخت دستور با --browser-executable
      let command = `npx remotion render src/remotion/index.ts VideoTeaser ${outputFile} --props=${propsFile} --codec=h264 --fps=30 --duration=450`;
      
      if (browserPath) {
        command += ` --browser-executable="${browserPath}"`;
      }

      console.log(`🐞 [Renderer] اجرای دستور: ${command}`);
      const { stdout, stderr } = await execAsync(command, {
        cwd: process.cwd(),
        maxBuffer: 1024 * 1024 * 10,
      });

      if (stderr) {
        console.warn(`🐞 [Renderer] خروجی خطا: ${stderr}`);
      }
      console.log(`🐞 [Renderer] خروجی: ${stdout}`);

      // ۶. پاک کردن فایل JSON موقت
      try { fs.unlinkSync(propsFile); } catch (e) {}

      // ۷. بررسی وجود فایل
      if (fs.existsSync(outputFile)) {
        const stats = fs.statSync(outputFile);
        console.log(`🐞 [Renderer] ✅ فایل ساخته شد: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        return outputFile;
      } else {
        throw new Error('فایل خروجی ساخته نشد!');
      }
    } catch (error) {
      console.error(`🐞 [Renderer] ❌ خطا در رندر:`, error);
      throw error;
    }
  }

  /**
   * پیدا کردن مسیر مرورگر نصب‌شده روی سیستم
   */
  private static findBrowserPath(): string | null {
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return null;
  }
}