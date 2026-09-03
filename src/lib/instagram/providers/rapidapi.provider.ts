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
    console.log(`🐞 [RapidAPI] مقداردهی اولیه با Host: ${config.host}`);
    this.apiKey = config.apiKey;
    this.host = config.host;
    this.baseUrl = config.baseUrl || 'https://instagram-scraper-api2.p.rapidapi.com';
  }

  async fetchProfile(username: string): Promise<InstagramProfileData> {
    console.log(`🐞 [RapidAPI] شروع دریافت پروفایل برای: ${username}`);

    try {
      // ۱. دریافت اطلاعات پروفایل
      console.log(`🐞 [RapidAPI] مرحله 1: ارسال درخواست به user_info...`);
      const profileResponse = await this.fetchUserInfo(username);
      console.log(`🐞 [RapidAPI] پاسخ پروفایل دریافت شد. is_private: ${profileResponse.is_private}`);

      // ۲. دریافت پست‌های اخیر
      console.log(`🐞 [RapidAPI] مرحله 2: ارسال درخواست به user_posts...`);
      const postsResponse = await this.fetchUserPosts(username, 6);
      console.log(`🐞 [RapidAPI] تعداد پست‌های دریافت‌شده: ${postsResponse.length}`);

      // ۳. ترکیب و اعتبارسنجی با Zod
      console.log(`🐞 [RapidAPI] مرحله 3: ترکیب داده‌ها و اعتبارسنجی با Zod...`);
      const rawData = {
        username: profileResponse.username,
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

      const validated = InstagramProfileDataSchema.parse(rawData);
      console.log(`🐞 [RapidAPI] ✅ اعتبارسنجی با موفقیت انجام شد. نام کاربری: ${validated.username}`);
      return validated;
    } catch (error: any) {
      console.error(`🐞 [RapidAPI] ❌ خطا در حین دریافت داده:`, error.message || error);
      this.handleApiError(error, username);
      throw error;
    }
  }

  private async fetchUserInfo(username: string): Promise<any> {
    const url = `${this.baseUrl}/v1/user_info?username=${username}`;
    console.log(`🐞 [RapidAPI] ارسال درخواست به: ${url}`);

    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.host,
      },
    });

    console.log(`🐞 [RapidAPI] وضعیت پاسخ (Status): ${response.status}`);

    if (!response.ok) {
      console.error(`🐞 [RapidAPI] خطای HTTP: ${response.status} ${response.statusText}`);
      throw new Error(`RapidAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`🐞 [RapidAPI] داده‌های خام پروفایل دریافت شد.`);

    // برخی APIها پاسخ را در data.data قرار می‌دهند
    return data.data || data;
  }

  private async fetchUserPosts(username: string, limit: number): Promise<any[]> {
    const url = `${this.baseUrl}/v1/user_posts?username=${username}&limit=${limit}`;
    console.log(`🐞 [RapidAPI] ارسال درخواست به: ${url}`);

    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.host,
      },
    });

    console.log(`🐞 [RapidAPI] وضعیت پاسخ پست‌ها (Status): ${response.status}`);

    if (!response.ok) {
      console.error(`🐞 [RapidAPI] خطای HTTP در پست‌ها: ${response.status} ${response.statusText}`);
      throw new Error(`RapidAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`🐞 [RapidAPI] داده‌های خام پست‌ها دریافت شد.`);

    // برخی APIها posts را در data.data.items برمی‌گردانند
    const posts = data.data?.items || data.items || data || [];
    return posts;
  }

  private handleApiError(error: any, username: string): never {
    console.error(`🐞 [RapidAPI] مدیریت خطا: ${error.message}`);

    if (error.message?.includes('404') || error.message?.includes('not found')) {
      throw new InstagramNotFoundError(username);
    }
    if (error.message?.includes('private') || error.message?.includes('is_private')) {
      throw new InstagramPrivateAccountError(username);
    }
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      throw new InstagramRateLimitError();
    }
    throw new InstagramScraperError(
      error.message || 'خطا در دریافت اطلاعات از اینستاگرام',
      'UNKNOWN'
    );
  }
}// RapidAPI impl will be added here