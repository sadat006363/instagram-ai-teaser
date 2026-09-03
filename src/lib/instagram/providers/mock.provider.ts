import { InstagramScraperProvider } from './instagram.provider';
import { InstagramProfileData } from '../types/instagram.types';

export class MockInstagramProvider implements InstagramScraperProvider {
  async fetchProfile(username: string): Promise<InstagramProfileData> {
    console.log(`🐞 [Mock] شروع دریافت داده‌های ساختگی برای کاربر: ${username}`);

    // شبیه‌سازی تأخیر شبکه
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`🐞 [Mock] تأخیر ۸۰۰ میلی‌ثانیه‌ای شبیه‌سازی شد.`);

    const mockData: InstagramProfileData = {
      username,
      fullName: `${username} (Mock Data)`,
      bio: 'این یک بیوگرافی آزمایشی برای توسعه‌دهندگان است 🚀',
      profilePicUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=IG',
      followersCount: Math.floor(Math.random() * 10000) + 100,
      isPrivate: false,
      posts: Array.from({ length: 6 }, (_, i) => ({
        id: `mock-post-${i}`,
        imageUrl: `https://picsum.photos/seed/${username}${i}/600/600`,
        caption: `این کپشن پست شماره ${i+1} است. #تست #مک`,
        likesCount: Math.floor(Math.random() * 500) + 50,
      })),
    };

    console.log(`🐞 [Mock] داده‌های ساختگی با ${mockData.posts.length} پست تولید شد.`);
    console.log(`🐞 [Mock] نام کامل: ${mockData.fullName}, فالوور: ${mockData.followersCount}`);
    return mockData;
  }
}// Mock impl will be added here