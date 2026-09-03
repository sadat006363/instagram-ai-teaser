import { supabaseAdmin } from '@/lib/supabase/admin';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const BUCKET_NAME = 'teasers';
const EXPIRES_IN_SECONDS = 3600; // ۱ ساعت

export class VideoStorage {
  /**
   * آپلود ویدیو در Supabase Storage با استفاده از کلاینت ادمین
   * @param filePath - مسیر فایل محلی
   * @param bucket - نام باکت (پیش‌فرض: 'teasers')
   * @param userId - (اختیاری) شناسه کاربر برای ذخیره‌سازی در مسیر
   * @returns URL عمومی یا لینک امضا شده
   */
  static async uploadVideo(
    filePath: string,
    bucket: string = BUCKET_NAME,
    userId?: string
  ): Promise<string> {
    console.log(`🐞 [Storage] شروع آپلود ویدیو با کلاینت ادمین...`);

    // ۱. خواندن فایل
    if (!fs.existsSync(filePath)) {
      throw new Error(`فایل ${filePath} وجود ندارد`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const originalFileName = path.basename(filePath);
    const fileExtension = path.extname(originalFileName) || '.mp4';

    // ۲. ساخت نام یکتا و امن برای فایل
    const uniqueId = randomUUID();
    const timestamp = Date.now();
    const safeFileName = `${timestamp}-${uniqueId}${fileExtension}`;
    const storagePath = userId
      ? `users/${userId}/videos/${safeFileName}`
      : `videos/${safeFileName}`;

    console.log(`🐞 [Storage] مسیر ذخیره‌سازی: ${storagePath}`);
    console.log(`🐞 [Storage] حجم فایل: ${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // ۳. آپلود با کلاینت ادمین
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(storagePath, fileBuffer, {
        contentType: 'video/mp4',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error(`🐞 [Storage] ❌ خطا در آپلود:`, error);
      throw new Error(`خطا در آپلود ویدیو: ${error.message}`);
    }

    console.log(`🐞 [Storage] ✅ آپلود موفق:`, data);

    // ۴. دریافت لینک عمومی یا امضا شده
    // اگر باکت Public است، از getPublicUrl استفاده کنید
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    // اگر باکت Private است، از createSignedUrl استفاده کنید (غیرفعال کردن خط زیر و فعال کردن کد کامنت‌شده)
    // const { data: signedUrlData, error: signedError } = await supabaseAdmin.storage
    //   .from(bucket)
    //   .createSignedUrl(storagePath, EXPIRES_IN_SECONDS);
    // if (signedError) throw signedError;
    // const publicUrl = signedUrlData.signedUrl;

    const publicUrl = urlData.publicUrl;
    console.log(`🐞 [Storage] ✅ URL عمومی: ${publicUrl}`);

    // ۵. پاک کردن فایل محلی
    try {
      fs.unlinkSync(filePath);
      console.log(`🐞 [Storage] فایل محلی پاک شد: ${filePath}`);
    } catch (cleanupError) {
      console.warn(`🐞 [Storage] ⚠️ خطا در پاک کردن فایل محلی:`, cleanupError);
    }

    return publicUrl;
  }

  /**
   * حذف یک فایل از Supabase Storage
   * @param filePath - مسیر فایل در باکت
   * @param bucket - نام باکت
   */
  static async deleteVideo(filePath: string, bucket: string = BUCKET_NAME): Promise<void> {
    console.log(`🐞 [Storage] حذف فایل: ${filePath}`);
    const { error } = await supabaseAdmin.storage.from(bucket).remove([filePath]);
    if (error) {
      console.error(`🐞 [Storage] ❌ خطا در حذف فایل:`, error);
      throw error;
    }
    console.log(`🐞 [Storage] ✅ فایل حذف شد`);
  }
}