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
    const availablePostsCount = profile.posts?.length || 0;
    console.log(`🐞 [ScriptGen] تعداد پست‌های موجود: ${availablePostsCount}`);

    // اگر پستی وجود نداشت یا کلید OpenAI نبود -> حالت Mock ایمن
    if (!process.env.OPENAI_API_KEY || availablePostsCount === 0) {
      console.log(`🐞 [ScriptGen] ⚠️ فعال‌سازی حالت Mock (عدم وجود کلید یا پست).`);
      return this.generateMockScript(profile);
    }

    try {
      const systemPrompt = this.buildSystemPrompt(profile, availablePostsCount);
      const userPrompt = this.buildUserPrompt(profile);

      console.log(`🐞 [ScriptGen] ارسال درخواست به OpenAI (gpt-4o-mini)...`);
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const rawContent = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(rawContent);

      // اعتبارسنجی اولیه با Zod
      let validated = ScriptSchema.parse(parsed);

      // محافظت: اصلاح ایندکس‌های غیرمجاز پست‌ها
      validated.scenes = validated.scenes.map((scene) => ({
        ...scene,
        postIndex: Math.min(Math.max(0, scene.postIndex), availablePostsCount - 1),
      }));

      // محافظت: همگام‌سازی زمان‌بندی دقیق برای تیزر ۱۵ ثانیه‌ای (مجموع دقیقاً ۱۵ ثانیه)
      validated = this.normalizeSceneDurations(validated, 15);

      console.log(`🐞 [ScriptGen] ✅ فیلم‌نامه با موفقیت تولید و نرمال‌سازی شد.`);
      return validated;

    } catch (error) {
      console.error(`🐞 [ScriptGen] ❌ خطا در تولید فیلم‌نامه:`, error);
      if (error instanceof ZodError) {
        console.error(`🐞 [ScriptGen] ❌ خطای اعتبارسنجی Zod:`, error.issues);
      }
      return this.generateMockScript(profile);
    }
  }

  private buildSystemPrompt(profile: InstagramProfileData, maxPosts: number): string {
    const maxIndex = Math.max(0, maxPosts - 1);
    return `
شما یک کارگردان حرفه‌ای تیزرهای تبلیغاتی اینستاگرام (Reels/Stories) هستید.
وظیفه شما ساخت سناریوی یک تیزر ویدیویی دقیقا ۱۵ ثانیه‌ای جذاب از پیج زیر است:

اطلاعات پیج:
- نام کاربری: ${profile.username}
- نام نمایشی: ${profile.fullName || profile.username}
- بایو: ${profile.bio || 'بدون بیوگرافی'}
- تعداد فالوور: ${profile.followersCount || 0}

قوانین سخت‌گیرانه تولید سناریو:
۱. **Hook (قلاب ۳ ثانیه اول):** یک جمله تکان‌دهنده، کنجکاوکننده یا پرانرژی فارسی.
۲. **صحنه‌ها (Scenes):** حداکثر ۳ الی ۴ صحنه بسازید. ایندکس انتخابی برای "postIndex" باید حتما عددی بین 0 تا ${maxIndex} باشد.
۳. **کپشن صحنه‌ها:** هر کپشن نهایتا ۱۰ کلمه باشد تا روی صفحه گوشی خوانا بماند.
۴. **مجموع زمان صحنه‌ها:** جمع duration تمام صحنه‌ها باید دقیقا برابر با ۱۵ ثانیه شود.
۵. **پالت رنگی:** ۲ کد رنگ Hex جذاب متناسب با حوزه کاری پیج (مثلا مدرن، نئون، لاکچری یا گرم).
۶. **Audio Mood:** فقط یکی از مقادیر: "upbeat" | "luxury" | "minimal" | "dramatic".
۷. **Animations:** فقط از مقادیر: "zoom-in" | "fade" | "slide-up" | "zoom-out".

فرمت پاسخ صرفاً یک شیء JSON با ساختار زیر باشد:
{
  "hook": "متن جذاب قلاب",
  "scenes": [
    { "postIndex": 0, "duration": 4, "caption": "توضیح کوتاه صحنه", "animation": "zoom-in" }
  ],
  "cta": "همین حالا ما را دنبال کنید!",
  "brandHandle": "${profile.username}",
  "colorPalette": { "primary": "#FF3366", "secondary": "#20E2D7", "text": "#FFFFFF" },
  "audioMood": "upbeat"
}
`;
  }

  private buildUserPrompt(profile: InstagramProfileData): string {
    const postsSummary = (profile.posts || [])
      .slice(0, 6)
      .map((post, index) => {
        const captionClean = (post.caption || 'بدون متن').replace(/\n/g, ' ').substring(0, 80);
        return `[پست ایندکس ${index}] لایک: ${post.likesCount || 0} | متن: "${captionClean}"`;
      })
      .join('\n');

    return `اطلاعات پست‌های برتر پیج:\n${postsSummary || 'پستی یافت نشد.'}\n\nیک سناریوی فوق‌العاده برای تیزر بساز:`;
  }

  private normalizeSceneDurations(script: Script, targetTotalSeconds: number = 15): Script {
    if (!script.scenes || script.scenes.length === 0) return script;
    
    const currentTotal = script.scenes.reduce((sum, s) => sum + (s.duration || 3), 0);
    if (currentTotal === targetTotalSeconds) return script;

    // تقسیم متوازن زمان بین صحنه‌ها
    const sceneCount = script.scenes.length;
    const baseDuration = Math.floor(targetTotalSeconds / sceneCount);
    let remainder = targetTotalSeconds % sceneCount;

    script.scenes = script.scenes.map((scene) => {
      const extra = remainder > 0 ? 1 : 0;
      if (remainder > 0) remainder--;
      return {
        ...scene,
        duration: baseDuration + extra,
      };
    });

    return script;
  }

  private generateMockScript(profile: InstagramProfileData): Script {
    console.log(`🐞 [ScriptGen] 🎭 تولید فیلم‌نامه‌ی Mock ایمن برای ${profile.username}`);

    const safePosts = profile.posts && profile.posts.length > 0 ? profile.posts.slice(0, 3) : [];
    
    const scenes = safePosts.length > 0
      ? safePosts.map((post, index) => ({
          postIndex: index,
          duration: index === 0 ? 5 : 5,
          caption: (post.caption || `محتوای جذاب شماره ${index + 1}`).substring(0, 50),
          animation: (['zoom-in', 'slide-up', 'fade'][index % 3]) as any,
        }))
      : [
          { postIndex: 0, duration: 5, caption: 'جدیدترین محتواهای پیج', animation: 'zoom-in' as any },
          { postIndex: 0, duration: 5, caption: 'همراه ما باشید', animation: 'fade' as any },
          { postIndex: 0, duration: 5, caption: 'تجربه‌ای متفاوت', animation: 'slide-up' as any },
        ];

    return {
      hook: `با دنیای ${profile.fullName || profile.username} همراه شوید! 🔥`,
      scenes: scenes,
      cta: `پیج @${profile.username} را دنبال کنید ✨`,
      brandHandle: profile.username,
      colorPalette: {
        primary: '#FF2A6D',
        secondary: '#05D9E8',
        text: '#FFFFFF',
      },
      audioMood: 'upbeat',
    };
  }
}
