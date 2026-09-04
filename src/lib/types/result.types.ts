import { InstagramProfileData } from '@/lib/instagram/types/instagram.types';
import { BrandProfile } from '@/lib/scene/brand-profile';
import { Template } from '@/lib/scene/template-selector';
import { ScenePlan } from '@/lib/scene/scene-plan';
import { Script } from '@/lib/instagram/schemas/script.schema';

export interface RemotionProps {
  posts: {
    id: string;
    imageUrl: string;
    caption: string;
    likesCount: number;
  }[];
  script: {
    hook: string;
    scenes: {
      postIndex: number;
      duration: number;
      caption: string;
      animation: 'zoom-in' | 'zoom-out' | 'slide-up' | 'fade';
    }[];
    cta: string;
    brandHandle: string;
    colorPalette: {
      primary: string;
      secondary: string;
      text: string;
    };
    audioMood: string;
  };
}

export interface RenderActionResult {
  success: boolean;
  profile?: InstagramProfileData;
  brandProfile?: BrandProfile;
  template?: Template;
  script?: Script;
  scenePlan?: ScenePlan;
  remotionProps?: RemotionProps;
  previewMode?: 'client';
  error?: {
    message: string;
    code: string;
  };
}