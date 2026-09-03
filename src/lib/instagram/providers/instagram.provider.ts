import { InstagramProfileData } from '../types/instagram.types';

export interface InstagramScraperProvider {
  fetchProfile(username: string): Promise<InstagramProfileData>;
}// Provider interface will be added here