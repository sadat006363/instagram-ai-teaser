export interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  likesCount: number;
}

export interface InstagramProfileData {
  username: string;
  fullName: string;
  bio: string;
  profilePicUrl: string;
  followersCount: number;
  isPrivate: boolean;
  posts: InstagramPost[]; // حداکثر ۶ پست اخیر
}

export interface InstagramScraperConfig {
  apiKey: string;
  host: string;
  baseUrl?: string;
}

export type ScraperProviderType = 'rapidapi' | 'mock';// Types will be added here