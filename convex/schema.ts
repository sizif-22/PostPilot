import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  collection: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    updatedAt: v.string(), // ISO date string for updated time
    facebook: v.optional(
      v.object({
        id: v.string(),
        name: v.string(),
        accessToken: v.string(),
        tokenExpiry: v.optional(v.string()),
        remainingTime: v.optional(v.number()),
      }),
    ),
    x: v.optional(
      v.object({
        name: v.string(),
        username: v.string(),
        accessToken: v.string(),
        userId: v.string(),
        isPersonal: v.boolean(),
        refreshToken: v.optional(v.string()),
        tokenExpiry: v.optional(v.string()),
        remainingTime: v.optional(v.number()),
        v1aAccessToken: v.optional(v.string()),
        v1aAccessSecret: v.optional(v.string()),
      }),
    ),
    instagram: v.optional(
      v.object({
        pageId: v.string(),
        pageName: v.string(),
        pageAccessToken: v.string(),
        instagramId: v.string(),
        instagramUsername: v.string(),
        instagramName: v.string(),
        profilePictureUrl: v.string(),
        tokenExpiry: v.optional(v.string()),
        remainingTime: v.optional(v.number()),
      }),
    ),
    tiktok: v.optional(
      v.object({
        accessToken: v.string(),
        name: v.optional(v.string()),
        username: v.string(),
        openId: v.string(),
        tokenExpiry: v.optional(v.string()),
        refreshToken: v.optional(v.string()),
        remainingTime: v.optional(v.number()),
      }),
    ),
    linkedin: v.optional(
      v.object({
        accessToken: v.string(),
        name: v.optional(v.string()),
        username: v.string(),
        openId: v.string(),
        tokenExpiry: v.optional(v.string()),
        refreshToken: v.optional(v.string()),
        remainingTime: v.optional(v.number()),
      }),
    ),
    youtube: v.optional(
      v.object({
        name: v.string(),
        id: v.string(),
        accessToken: v.string(),
        refreshToken: v.optional(v.string()),
        tokenExpiry: v.optional(v.string()),
        username: v.optional(v.string()),
        channelUrl: v.optional(v.string()),
        tokenType: v.optional(v.string()),
        scope: v.optional(v.string()),
        remainingTime: v.optional(v.number()),
      }),
    ),
  }),
  user_collection: defineTable({
    collectionId: v.id('collection'),
    userId: v.string(),
    role: v.string(),
    updatedAt: v.optional(v.string()), // For sorting purposes
  })
    .index('by_user_and_updated', ['userId', 'updatedAt'])
    .index('by_collectionId', ['collectionId']),
});
