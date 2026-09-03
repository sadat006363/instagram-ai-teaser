import { InstagramScraperProvider } from './providers/instagram.provider';
import { RapidApiProvider } from './providers/rapidapi.provider';
import { MockInstagramProvider } from './providers/mock.provider';
import { ScraperProviderType } from './types/instagram.types';

export function createInstagramProvider(
  type: ScraperProviderType = 'rapidapi'
): InstagramScraperProvider {
  console.log(`🐞 [Factory] ایجاد Provider با نوع: ${type}`);

  switch (type) {
    case 'rapidapi': {
      const apiKey = process.env.RAPIDAPI_KEY;
      const host = process.env.RAPIDAPI_HOST;

      if (!apiKey || !host) {
        console.error('🐞 [Factory] ❌ متغیرهای محیطی RAPIDAPI_KEY یا RAPIDAPI_HOST تنظیم نشده‌اند!');
        throw new Error('RAPIDAPI_KEY و RAPIDAPI_HOST باید در .env.local تنظیم شوند.');
      }

      console.log(`🐞 [Factory] ✅ کلید API و Host یافت شد.`);

      const config = {
        apiKey,
        host,
        baseUrl: process.env.RAPIDAPI_BASE_URL,
      };

      return new RapidApiProvider(config);
    }

    case 'mock':
      console.log(`🐞 [Factory] ✅ برگرداندن Mock Provider برای توسعه.`);
      return new MockInstagramProvider();

    default:
      throw new Error(`Provider type "${type}" پشتیبانی نمی‌شود.`);
  }
}// Factory will be added here