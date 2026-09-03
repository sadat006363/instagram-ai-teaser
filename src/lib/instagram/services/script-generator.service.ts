import { OpenAI } from 'openai';
import { InstagramProfileData } from '../types/instagram.types';
import { ScriptSchema, Script } from '../schemas/script.schema';
import { ZodError } from 'zod';

export class ScriptGeneratorService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ OPENAI_API_KEY تنظیم نشده است. از داده‌های Mock استفاده می‌شود.');
    }
    this.openai = new OpenAI({
      apiKey: apiKey || 'sk-mock-key',
      dangerouslyAllowBrowser: false,
    });
  }

  async generateScript(profile: InstagramProfileData): Promise<Script> {
    console.log(`🐞 [ScriptGen] شروع تولید فیلم‌نامه برای ${profile.username}`);
    console.log(`🐞 [ScriptGen] تعداد پست‌های موجود: ${profile.posts.length}`);

    // اگر کلید API وجود نداشت، از داده‌های Mock استفاده کن
    if (!process.env.OPENAI_API_KEY) {
      console.log(`🐞 [ScriptGen] ⚠️ حالت Mock (بدون OpenAI) فعال شد.`);
      return this.generateMockScript(profile);
    }

    try {
      // ۱. ساخت پرامپت سیستم
      const systemPrompt = this.buildSystemPrompt(profile);

      // ۲. ارسال به OpenAI با خروجی ساختاریافته
      console.log(`🐞 [ScriptGen] ارسال درخواست به OpenAI...`);
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: this.buildUserPrompt(profile) },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const rawContent = response.choices[0]?.message?.content || '{}';
      console.log(`🐞 [ScriptGen] پاسخ خام از OpenAI: ${rawContent.substring(0, 200)}...`);

      // ۳. اعتبارسنجی با Zod
      const parsed = JSON.parse(rawContent);
      const validated = ScriptSchema.parse(parsed);
      console.log(`🐞 [ScriptGen] ✅ فیلم‌نامه با موفقیت تولید و اعتبارسنجی شد.`);
      console.log(`🐞 [ScriptGen] تعداد صحنه‌ها: ${validated.scenes.length}`);
      console.log(`🐞 [ScriptGen] هوای موسیقی: ${validated.audioMood}`);

      return validated;

    } catch (error) {
      console.error(`🐞 [ScriptGen] ❌ خطا در تولید فیلم‌نامه:`, error);

      if (error instanceof ZodError) {
        console.error(`🐞 [ScriptGen] ❌ خطای اعتبارسنجی Zod:`, error.issues);
      }

      // در صورت بروز خطا، به Mock برگرد
      console.log(`🐞 [ScriptGen] ⚠️ بازگشت به حالت Mock به دلیل خطا.`);
      return this.generateMockScript(profile);
    }
  }

  private buildSystemPrompt(profile: InstagramProfileData): string {
    return `
شما یک کارگردان تبلیغاتی حرفه‌ای برای اینستاگرام Reels و TikTok هستید.
شما باید یک تیزر ۱۵ ثانیه‌ای جذاب و ویروسی از یک پیج اینستاگرام بسازید.

اطلاعات پیج:
- نام کاربری: ${profile.username}
- نام کامل: ${profile.fullName}
- بیوگرافی: ${profile.bio || 'بدون بیوگرافی'}
- تعداد فالوور: ${profile.followersCount}

قوانین فیلم‌نامه‌نویسی:
۱. **قلب تیزر (Hook - ۰ تا ۳ ثانیه):** یک جمله‌ی کوتاه، غافلگیرکننده و جذاب که کاربر را مجبور به تماشا کند.
۲. **صحنه‌ها (۳ تا ۵ صحنه):** هر صحنه شامل انتخاب یک پست (بر اساس ایندکس ۰ تا ۵)، مدت زمان ۲ تا ۸ ثانیه، یک زیرنویس کوتاه و انیمیشن ورود.
۳. **دعوت به اقدام (CTA - ۱۲ تا ۱۵ ثانیه):** جمله‌ای که کاربر را به فالو کردن یا کلیک دعوت کند.
۴. **برند هندل:** نام کاربری پیج برای نمایش در انتهای ویدیو.
۵. **پالت رنگی:** انتخاب ۲ رنگ اصلی و یک رنگ متن (به صورت هگزادسیمال) که با برند هماهنگ باشد.
۶. **حال و هوای موسیقی:** یکی از گزینه‌های upbeat, luxury, minimal, dramatic.

خروجی را به صورت JSON با ساختار زیر برگردان:
{
  "hook": "...",
  "scenes": [
    { "postIndex": 0, "duration": 4, "caption": "...", "animation": "zoom-in" }
  ],
  "cta": "...",
  "brandHandle": "${profile.username}",
  "colorPalette": { "primary": "#...", "secondary": "#...", "text": "#..." },
  "audioMood": "upbeat"
}
`;
  }

  private buildUserPrompt(profile: InstagramProfileData): string {
    const postsSummary = profile.posts
      .map((post, index) => {
        return `پست ${index}: کپشن: "${post.caption || 'بدون کپشن'}" | تعداد لایک: ${post.likesCount}`;
      })
      .join('\n');

    return `
بر اساس اطلاعات زیر یک فیلم‌نامه‌ی حرفه‌ای برای تیزر این پیج بساز:

${postsSummary}
`;
  }

  private generateMockScript(profile: InstagramProfileData): Script {
    console.log(`🐞 [ScriptGen] 🎭 تولید فیلم‌نامه‌ی Mock برای ${profile.username}`);

    const mockPosts = profile.posts.slice(0, 4);

    return {
      hook: `با ${profile.fullName} آشنا شوید! 🔥`,
      scenes: mockPosts.map((post, index) => ({
        postIndex: index,
        duration: index === 0 ? 4 : 3,
        caption: post.caption.substring(0, 60) || `محتوای جذاب شماره ${index + 1}`,
        animation: ['zoom-in', 'fade', 'slide-up', 'zoom-out'][index % 4] as any,
      })),
      cta: `✨ ${profile.username} را دنبال کنید!`,
      brandHandle: profile.username,
      colorPalette: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        text: '#FFFFFF',
      },
      audioMood: 'upbeat',
    };
  }
}