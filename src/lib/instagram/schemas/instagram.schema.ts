import { z } from 'zod';

export const InstagramPostSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().url(),
  caption: z.string().max(2200).optional().default(''),
  likesCount: z.number().int().nonnegative().default(0),
});

export const InstagramProfileDataSchema = z.object({
  username: z.string().min(1),
  fullName: z.string().min(1),
  bio: z.string().max(150).optional().default(''),
  profilePicUrl: z.string().url(),
  followersCount: z.number().int().nonnegative(),
  isPrivate: z.boolean(),
  posts: z.array(InstagramPostSchema).max(6),
});

export type InstagramProfileData = z.infer<typeof InstagramProfileDataSchema>;