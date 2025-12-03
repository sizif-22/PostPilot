import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  collection: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    updatedAt: v.string(), // ISO date string for updated time
    tox: v.boolean(),
    facebook: v.optional(
      v.object({
        id: v.string(),
        name: v.string(),
        accessToken: v.string(),
        tokenExpiry: v.optional(v.string()),
        remainingTime: v.optional(v.number()),
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
        name: v.string(),
        accountType: v.string(),
        urn: v.optional(v.string()), // Make urn optional since personal accounts don't have it
        accessToken: v.string(),
        accountId: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        tokenExpiry: v.optional(v.string()),
        remainingTime: v.optional(v.number()),
        url: v.string(),
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
  users: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  })
    .index('by_userId', ['userId'])
    .index('by_email', ['email']),
  sessions: defineTable({
    collectionId: v.id('collection'),
    createdAt: v.string(),
    expiresAt: v.string(),
    actionCount: v.number(),
    status: v.string(), // 'active', 'expired', 'terminated'
  }).index('by_collectionId', ['collectionId']),
  invitations: defineTable({
    email: v.string(),
    collectionId: v.id('collection'),
    role: v.string(),
    status: v.string(), // 'pending', 'accepted'
    invitedBy: v.string(), // userId
    createdAt: v.string(),
  }).index('by_collectionId', ['collectionId']),
  user_collection: defineTable({
    collectionId: v.id('collection'),
    userId: v.string(),
    role: v.string(),
    updatedAt: v.optional(v.string()), // For sorting purposes
  })
    .index('by_user_and_updated', ['userId', 'updatedAt'])
    .index('by_collectionId', ['collectionId']),
  notifications: defineTable({
    userId: v.string(), // The user who receives the notification
    type: v.union(v.literal('invitation'), v.literal('announcement')),
    // For invitation notifications
    senderName: v.optional(v.string()),
    senderEmail: v.optional(v.string()),
    collectionId: v.optional(v.id('collection')),
    collectionName: v.optional(v.string()),
    role: v.optional(v.string()),
    // For announcement notifications
    title: v.optional(v.string()),
    message: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.string(), // ISO date string
  })
    .index('by_user', ['userId'])
    .index('by_user_and_read_status', ['userId', 'isRead']),
  posts: defineTable({
    collectionId: v.id('collection'),
    platforms: v.array(v.string()), // ['facebook', 'instagram', etc.]
    content: v.object({
      facebook: v.optional(v.string()),
      instagram: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      x: v.optional(v.string()),
      youtube: v.optional(
        v.object({
          title: v.string(),
          description: v.string(),
        }),
      ),
      tiktok: v.optional(
        v.object({
          title: v.string(),
          description: v.string(),
          privacy: v.string(),
          allowComment: v.boolean(),
          allowDuet: v.boolean(),
          allowStitch: v.boolean(),
        }),
      ),
    }),
    media: v.array(
      v.object({
        url: v.string(),
        name: v.string(),
        isVideo: v.boolean(),
      }),
    ),
    scheduledDate: v.optional(v.string()), // ISO date string if scheduled
    status: v.string(), // 'draft', 'scheduled', 'published', 'failed'
    createdAt: v.string(),
    updatedAt: v.string(),
    createdBy: v.string(), // userId
  }).index('by_collectionId', ['collectionId']),
});
