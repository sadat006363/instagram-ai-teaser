'use server';

import { z } from 'zod';
import { createInstagramProvider } from '@/lib/instagram/factory';
import { InstagramProfileDataSchema } from '@/lib/instagram/schemas/instagram.schema';
import { InstagramScraperError } from '@/lib/utils/errors';
import { ScraperProviderType } from '@/lib/instagram/types/instagram.types';

const InputSchema = z.object({
  username: z.string().min(1).max(30).regex(/^[a-zA-Z0-9._]+$/, 'نام کاربری نامعتبر است'),
});

export async function fetchInstagramProfile(
  username: string,
  providerType: ScraperProviderType = (process.env.SCRAPER_PROVIDER as ScraperProviderType) || 'rapidapi'
) {
  console.log(`🐞 [Action] ====== شروع پردازش ======`);
  console.log(`🐞 [Action] کاربر: ${username}`);
  console.log(`🐞 [Action] Provider انتخاب‌شده: ${providerType}`);
  console.log(`🐞 [Action] Environment: RAPIDAPI_KEY=${process.env.RAPIDAPI_KEY ? '✅ وجود دارد' : '❌ وجود ندارد'}`);
  console.log(`🐞 [Action] Environment: RAPIDAPI_HOST=${process.env.RAPIDAPI_HOST || '❌ وجود ندارد'}`);

  try {
    // ۱. اعتبارسنجی ورودی
    console.log(`🐞 [Action] مرحله 1: اعتبارسنجی ورودی...`);
    const { username: validatedUsername } = InputSchema.parse({ username });
    console.log(`🐞 [Action] ✅ ورودی معتبر است: ${validatedUsername}`);

    // ۲. دریافت Provider
    console.log(`🐞 [Action] مرحله 2: دریافت Provider...`);
    const provider = createInstagramProvider(providerType);
    console.log(`🐞 [Action] ✅ Provider ساخته شد`);

    // ۳. فراخوانی fetchProfile
    console.log(`🐞 [Action] مرحله 3: فراخوانی fetchProfile...`);
    const profileData = await provider.fetchProfile(validatedUsername);
    console.log(`🐞 [Action] ✅ داده‌ها دریافت شدند. تعداد پست‌ها: ${profileData.posts?.length || 0}`);

    // ۴. اعتبارسنجی نهایی
    console.log(`🐞 [Action] مرحله 4: اعتبارسنجی نهایی خروجی...`);
    const validatedData = InstagramProfileDataSchema.parse(profileData);
    console.log(`🐞 [Action] ✅ موفق! نام کامل: ${validatedData.fullName}`);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error(`🐞 [Action] ❌ خطا رخ داد:`, error);

    if (error instanceof InstagramScraperError) {
      console.error(`🐞 [Action] 📌 نوع خطا: InstagramScraperError`);
      console.error(`🐞 [Action] 📌 کد خطا: ${error.code}`);
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'SCRAPER_ERROR',
        },
      };
    }

    if (error instanceof z.ZodError) {
      console.error(`🐞 [Action] 📌 نوع خطا: ZodError`);
      console.error(`🐞 [Action] 📌 جزئیات:`, error.issues);
      return {
        success: false,
        error: {
          message: 'داده‌های دریافتی از اینستاگرام معتبر نیستند.',
          code: 'VALIDATION_ERROR',
          details: error.issues,
        },
      };
    }

    console.error(`🐞 [Action] 📌 نوع خطا: ناشناخته`);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'خطای غیرمنتظره‌ای رخ داد.',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}