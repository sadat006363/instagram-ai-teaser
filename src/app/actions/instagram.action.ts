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
  console.log(`🐞 [Action] شروع پردازش برای کاربر: ${username}`);
  console.log(`🐞 [Action] Provider انتخاب‌شده: ${providerType}`);

  try {
    console.log(`🐞 [Action] مرحله 1: اعتبارسنجی ورودی...`);
    const { username: validatedUsername } = InputSchema.parse({ username });
    console.log(`🐞 [Action] ✅ ورودی معتبر است: ${validatedUsername}`);

    console.log(`🐞 [Action] مرحله 2: دریافت Provider...`);
    const provider = createInstagramProvider(providerType);

    console.log(`🐞 [Action] مرحله 3: فراخوانی fetchProfile...`);
    const profileData = await provider.fetchProfile(validatedUsername);

    console.log(`🐞 [Action] مرحله 4: اعتبارسنجی نهایی خروجی...`);
    const validatedData = InstagramProfileDataSchema.parse(profileData);

    console.log(`🐞 [Action] ✅ موفق! تعداد پست‌ها: ${validatedData.posts.length}`);
    console.log(`🐞 [Action] ✅ نام کامل: ${validatedData.fullName}`);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error(`🐞 [Action] ❌ خطا رخ داد:`, error);

    if (error instanceof InstagramScraperError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'SCRAPER_ERROR',
        },
      };
    }

    if (error instanceof z.ZodError) {
      console.error(`🐞 [Action] ❌ خطای Zod:`,  error.issues);
      return {
        success: false,
        error: {
          message: 'داده‌های دریافتی از اینستاگرام معتبر نیستند.',
          code: 'VALIDATION_ERROR',
          details:  error.issues,
        },
      };
    }

    return {
      success: false,
      error: {
        message: 'خطای غیرمنتظره‌ای رخ داد. لطفاً مجدداً تلاش کنید.',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}