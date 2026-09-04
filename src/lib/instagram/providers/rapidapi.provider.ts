import { InstagramScraperProvider } from './instagram.provider';
import { InstagramProfileData, InstagramScraperConfig } from '../types/instagram.types';
import { InstagramProfileDataSchema } from '../schemas/instagram.schema';
import {
  InstagramNotFoundError,
  InstagramPrivateAccountError,
  InstagramRateLimitError,
  InstagramScraperError,
} from '@/lib/utils/errors';

export class RapidApiProvider implements InstagramScraperProvider {
  private readonly apiKey: string;
  private readonly host: string;
  private readonly baseUrl: string;

  constructor(config: InstagramScraperConfig) {
    console.log(`🐞 [RapidAPI] ====== مقداردهی اولیه ======`);
    console.log(`🐞 [RapidAPI] Host: ${config.host}`);
    console.log(`🐞 [RapidAPI] Base URL: ${config.baseUrl || 'پیش‌فرض'}`);
    console.log(`🐞 [RapidAPI] API Key: ${config.apiKey ? '✅ وجود دارد' : '❌ وجود ندارد'}`);
    
    this.apiKey = config.apiKey;
    this.host = config.host;
    this.baseUrl = config.baseUrl || 'https://instagram-scraper-api2.p.rapidapi.com';
  }

  async fetchProfile(username: string): Promise<InstagramProfileData> {
    console.log(`🐞 [RapidAPI] ====== شروع دریافت پروفایل ======`);
    console.log(`🐞 [RapidAPI] نام کاربری: ${username}`);

    try {
      // ۱. دریافت اطلاعات پروفایل
      console.log(`🐞 [RapidAPI] مرحله 1: ارسال درخواست به user_info...`);
      const profileResponse = await this.fetchUserInfo(username);
      console.log(`🐞 [RapidAPI] ✅ پاسخ پروفایل دریافت شد.`);
      console.log(`🐞 [RapidAPI] 📌 is_private: ${profileResponse.is_private}`);
      console.log(`🐞 [RapidAPI] 📌 username: ${profileResponse.username}`);

      // ۲. دریافت پست‌های اخیر
      console.log(`🐞 [RapidAPI] مرحله 2: ارسال درخواست به user_posts...`);
      const postsResponse = await this.fetchUserPosts(username, 6);
      console.log(`🐞 [RapidAPI] ✅ تعداد پست‌های دریافت‌شده: ${postsResponse.length}`);

      // ۳. ترکیب و اعتبارسنجی
      console.log(`🐞 [RapidAPI] مرحله 3: ترکیب و اعتبارسنجی داده‌ها...`);
      const rawData = {
        username: profileResponse.username || username,
        fullName: profileResponse.full_name || profileResponse.fullName || username,
        bio: profileResponse.biography || profileResponse.bio || '',
        profilePicUrl: profileResponse.profile_pic_url || profileResponse.profilePicUrl || '',
        followersCount: profileResponse.follower_count || profileResponse.followersCount || 0,
        isPrivate: profileResponse.is_private || profileResponse.isPrivate || false,
        posts: postsResponse.map((post: any) => ({
          id: post.id || post.pk || '',
          imageUrl: post.image_url || post.display_url || post.imageUrl || '',
          caption: post.caption || post.caption_text || '',
          likesCount: post.like_count || post.likesCount || 0,
        })),
      };

      console.log(`🐞 [RapidAPI] 📌 داده‌های خام:`, {
        username: rawData.username,
        fullName: rawData.fullName,
        postsCount: rawData.posts.length,
        followers: rawData.followersCount,
      });

      const validated = InstagramProfileDataSchema.parse(rawData);
      console.log(`🐞 [RapidAPI] ✅ اعتبارسنجی با موفقیت انجام شد.`);
      return validated;
    } catch (error: any) {
      console.error(`🐞 [RapidAPI] ❌ خطا در حین دریافت داده:`, error);
      console.error(`🐞 [RapidAPI] 📌 پیام خطا: ${error.message}`);
      if (error.response) {
        console.error(`🐞 [RapidAPI] 📌 وضعیت پاسخ: ${error.response.status}`);
        console.error(`🐞 [RapidAPI] 📌 داده‌های پاسخ:`, error.response.data);
      }
      this.handleApiError(error, username);
      throw error;
    }
  }

  /**
   * دریافت اطلاعات پروفایل کاربر با پشتیبانی از Retry
   */
  private async fetchUserInfo(username: string): Promise<any> {
    const url = `${this.baseUrl}/v1/user_info?username=${username}`;
    const response = await this.fetchWithRetry(url);
    const data = await response.json();
    
    // برخی APIها پاسخ را در data.data قرار می‌دهند
    const result = data.data || data;
    console.log(`🐞 [RapidAPI] 📌 ساختار پاسخ: ${Object.keys(result).join(', ')}`);
    return result;
  }

  /**
   * دریافت پست‌های کاربر با پشتیبانی از Retry
   */
  private async fetchUserPosts(username: string, limit: number): Promise<any[]> {
    const url = `${this.baseUrl}/v1/user_posts?username=${username}&limit=${limit}`;
    const response = await this.fetchWithRetry(url);
    const data = await response.json();
    
    // برخی APIها posts را در data.data.items برمی‌گردانند
    const posts = data.data?.items || data.items || data || [];
    console.log(`🐞 [RapidAPI] 📌 تعداد پست‌ها در پاسخ: ${posts.length}`);
    return posts;
  }

  /**
   * ارسال درخواست با پشتیبانی از Retry (تلاش مجدد خودکار)
   * @param url - آدرس درخواست
   * @param retries - تعداد تلاش مجدد (پیش‌فرض ۳)
   * @param delay - تاخیر اولیه به میلی‌ثانیه (پیش‌فرض ۱۰۰۰ms)
   */
  private async fetchWithRetry(
    url: string,
    retries: number = 3,
    delay: number = 1000
  ): Promise<Response> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🐞 [RapidAPI] 📤 تلاش ${attempt}/${retries}: ${url}`);
        const response = await fetch(url, {
          headers: {
            'x-rapidapi-key': this.apiKey,
            'x-rapidapi-host': this.host,
          },
        });

        console.log(`🐞 [RapidAPI] 📥 وضعیت پاسخ: ${response.status}`);

        // در صورت خطای Rate Limit یا 403، تلاش مجدد
        if (response.status === 429 || response.status === 403) {
          const errorText = await response.text();
          console.warn(`🐞 [RapidAPI] ⚠️ خطا در تلاش ${attempt}: ${response.status}`);
          console.warn(`🐞 [RapidAPI] ⚠️ متن پاسخ: ${errorText}`);

          if (attempt === retries) {
            console.error(`🐞 [RapidAPI] ❌ تمام تلاش‌ها (${retries}) ناموفق بود.`);
            throw new Error(`Rate limit exceeded after ${retries} attempts.`);
          }

          // تاخیر افزایشی: ۱ ثانیه، ۲ ثانیه، ۳ ثانیه
          const waitTime = delay * attempt;
          console.log(`🐞 [RapidAPI] ⏳ منتظر ${waitTime}ms قبل از تلاش مجدد...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return response;
      } catch (error) {
        if (attempt === retries) {
          console.error(`🐞 [RapidAPI] ❌ تلاش ${attempt} ناموفق، پرتاب خطا.`);
          throw error;
        }
        console.warn(`🐞 [RapidAPI] ⚠️ خطا در تلاش ${attempt}:`, error);
        const waitTime = delay * attempt;
        console.log(`🐞 [RapidAPI] ⏳ منتظر ${waitTime}ms قبل از تلاش مجدد...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    throw new Error('Failed after all retries.');
  }

  /**
   * مدیریت خطاهای API
   */
  private handleApiError(error: any, username: string): never {
    console.error(`🐞 [RapidAPI] 🛠️ مدیریت خطا...`);

    // خطاهای HTTP
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      console.error(`🐞 [RapidAPI] 📌 کاربر یافت نشد`);
      throw new InstagramNotFoundError(username);
    }
    if (error.message?.includes('private') || error.message?.includes('is_private')) {
      console.error(`🐞 [RapidAPI] 📌 حساب خصوصی است`);
      throw new InstagramPrivateAccountError(username);
    }
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      console.error(`🐞 [RapidAPI] 📌 محدودیت نرخ درخواست`);
      throw new InstagramRateLimitError();
    }
    if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
      console.error(`🐞 [RapidAPI] 📌 خطای 403 - احتمالاً کلید API نامعتبر، اشتراک منقضی، یا محدودیت دسترسی`);
      throw new InstagramScraperError(
        'خطای 403: دسترسی غیرمجاز. کلید API یا اشتراک را بررسی کنید.',
        'FORBIDDEN'
      );
    }
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      console.error(`🐞 [RapidAPI] 📌 خطای 401 - کلید API نامعتبر`);
      throw new InstagramScraperError(
        'خطای 401: کلید API نامعتبر. لطفاً کلید را بررسی کنید.',
        'UNAUTHORIZED'
      );
    }

    console.error(`🐞 [RapidAPI] 📌 خطای ناشناخته`);
    throw new InstagramScraperError(
      error.message || 'خطا در دریافت اطلاعات از اینستاگرام',
      'UNKNOWN'
    );
  }
}