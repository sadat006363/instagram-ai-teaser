import { InstagramScraperProvider } from './providers/instagram.provider';
import { RapidApiProvider } from './providers/rapidapi.provider';
import { MockInstagramProvider } from './providers/mock.provider';
import { ScraperProviderType } from './types/instagram.types';

export function createInstagramProvider(
  type: ScraperProviderType = 'rapidapi'
): InstagramScraperProvider {
  console.log(`🐞 [Factory] ====== شروع ایجاد Provider ======`);
  console.log(`🐞 [Factory] نوع درخواستی: ${type}`);
  console.log(`🐞 [Factory] SCRAPER_PROVIDER از env: ${process.env.SCRAPER_PROVIDER}`);

  // اگر نوع mock نباشد، اما کلید RapidAPI وجود نداشته باشد، به mock برگرد
  if (type === 'rapidapi') {
    const apiKey = process.env.RAPIDAPI_KEY;
    const host = process.env.RAPIDAPI_HOST;

    console.log(`🐞 [Factory] RAPIDAPI_KEY: ${apiKey ? '✅ وجود دارد' : '❌ وجود ندارد'}`);
    console.log(`🐞 [Factory] RAPIDAPI_HOST: ${host || '❌ وجود ندارد'}`);

    if (!apiKey || !host) {
      console.warn(`🐞 [Factory] ⚠️ کلید RapidAPI تنظیم نشده است. برگشت به Mock.`);
      console.warn(`🐞 [Factory] برای استفاده از RapidAPI، RAPIDAPI_KEY و RAPIDAPI_HOST را در .env.local تنظیم کنید.`);
      console.log(`🐞 [Factory] ✅ برگرداندن Mock Provider (به‌دلیل عدم وجود کلید).`);
      return new MockInstagramProvider();
    }

    console.log(`🐞 [Factory] ✅ برگرداندن RapidAPI Provider.`);
    return new RapidApiProvider({
      apiKey,
      host,
      baseUrl: process.env.RAPIDAPI_BASE_URL,
    });
  }

  if (type === 'mock') {
    console.log(`🐞 [Factory] ✅ برگرداندن Mock Provider.`);
    return new MockInstagramProvider();
  }

  console.error(`🐞 [Factory] ❌ نوع Provider نامعتبر: ${type}`);
  throw new Error(`Provider type "${type}" پشتیبانی نمی‌شود.`);
}