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
    this.baseUrl = config.baseUrl || 'https://instagram-scraper-stable-api.p.rapidapi.com';
  }

  async fetchProfile(username: string): Promise<InstagramProfileData> {
    console.log(`🐞 [RapidAPI] ====== شروع دریافت پروفایل ======`);
    console.log(`🐞 [RapidAPI] نام کاربری: ${username}`);

    try {
      // ۱. دریافت اطلاعات پروفایل (شامل پست‌ها)
      console.log(`🐞 [RapidAPI] مرحله 1: ارسال درخواست به اندپوینت جدید...`);
      const data = await this.fetchUserData(username);
      console.log(`🐞 [RapidAPI] ✅ پاسخ دریافت شد.`);

      // ۲. استخراج داده‌ها از پاسخ
      const userData = data.user_data || data;
      
      if (!userData || !userData.username) {
        throw new Error('داده‌های کاربر یافت نشد.');
      }

      console.log(`🐞 [RapidAPI] 📌 is_private: ${userData.is_private || false}`);
      console.log(`🐞 [RapidAPI] 📌 username: ${userData.username}`);

      // ۳. استخراج پست‌ها
      let posts: any[] = [];
      
      // بررسی ساختارهای مختلف پاسخ
      if (userData.edge_owner_to_timeline_media?.edges) {
        posts = userData.edge_owner_to_timeline_media.edges.map((edge: any) => edge.node);
      } else if (userData.posts) {
        posts = userData.posts;
      } else if (userData.media && Array.isArray(userData.media)) {
        posts = userData.media;
      } else if (userData.items && Array.isArray(userData.items)) {
        posts = userData.items;
      }

      console.log(`🐞 [RapidAPI] ✅ تعداد پست‌های دریافت‌شده: ${posts.length}`);

      // ۴. استخراج اطلاعات پروفایل
      const profilePicUrl = userData.hd_profile_pic_url_info?.url || 
                            userData.profile_pic_url_hd || 
                            userData.profile_pic_url || 
                            '';

      // ۵. ترکیب و اعتبارسنجی
      console.log(`🐞 [RapidAPI] مرحله 2: ترکیب و اعتبارسنجی داده‌ها...`);
      const rawData = {
        username: userData.username || username,
        fullName: userData.full_name || userData.fullName || username,
        bio: userData.biography || userData.bio || '',
        profilePicUrl: profilePicUrl,
        followersCount: userData.follower_count || userData.followersCount || userData.followerCount || 0,
        isPrivate: userData.is_private || userData.isPrivate || false,
        posts: posts.slice(0, 6).map((post: any) => {
          // استخراج کپشن
          let caption = '';
          if (post.edge_media_to_caption?.edges?.[0]?.node?.text) {
            caption = post.edge_media_to_caption.edges[0].node.text;
          } else if (post.caption) {
            caption = post.caption;
          } else if (post.caption_text) {
            caption = post.caption_text;
          }

          // استخراج URL تصویر
          let imageUrl = '';
          if (post.display_url) {
            imageUrl = post.display_url;
          } else if (post.image_url) {
            imageUrl = post.image_url;
          } else if (post.thumbnail_src) {
            imageUrl = post.thumbnail_src;
          } else if (post.image_versions2?.candidates?.length > 0) {
            imageUrl = post.image_versions2.candidates[0].url;
          } else {
            imageUrl = profilePicUrl; // فال‌بک به عکس پروفایل
          }

          // استخراج تعداد لایک
          let likesCount = 0;
          if (post.edge_media_preview_like?.count !== undefined) {
            likesCount = post.edge_media_preview_like.count;
          } else if (post.like_count !== undefined) {
            likesCount = post.like_count;
          } else if (post.likesCount !== undefined) {
            likesCount = post.likesCount;
          } else if (post.likes && post.likes.count !== undefined) {
            likesCount = post.likes.count;
          }

          return {
            id: post.id || post.pk || '',
            imageUrl: imageUrl,
            caption: caption || '',
            likesCount: likesCount || 0,
          };
        }),
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
      this.handleApiError(error, username);
      throw error;
    }
  }

  /**
   * دریافت داده‌های کاربر از اندپوینت جدید
   */
  private async fetchUserData(username: string): Promise<any> {
    const url = `${this.baseUrl}/ig_get_fb_profile_hover.php?username_or_url=${username}`;
    const response = await this.fetchWithRetry(url);
    const data = await response.json();
    
    console.log(`🐞 [RapidAPI] 📌 ساختار پاسخ: ${Object.keys(data).join(', ')}`);
    return data;
  }

  /**
   * ارسال درخواست با پشتیبانی از Retry (تلاش مجدد خودکار)
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

        // خطاهای موقت (۴۲۹، ۵xx) -> Retry
        if (response.status === 429 || response.status >= 500) {
          const errorText = await response.text();
          console.warn(`🐞 [RapidAPI] ⚠️ خطا در تلاش ${attempt}: ${response.status}`);
          console.warn(`🐞 [RapidAPI] ⚠️ متن پاسخ: ${errorText}`);

          if (attempt === retries) {
            throw new Error(`Rate limit or server error after ${retries} attempts.`);
          }

          const waitTime = delay * attempt;
          console.log(`🐞 [RapidAPI] ⏳ منتظر ${waitTime}ms قبل از تلاش مجدد...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // خطاهای دائمی (۴۰۳، ۴۰۱، ۴۰۴) -> بدون Retry
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return response;
      } catch (error) {
        if (attempt === retries) throw error;
        console.warn(`🐞 [RapidAPI] ⚠️ خطا در تلاش ${attempt}:`, error);
        const waitTime = delay * attempt;
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