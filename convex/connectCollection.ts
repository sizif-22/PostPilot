import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { Id } from './_generated/dataModel';
import { refreshXFunc } from '../app/connection/x/server-action';
export interface facebookChannelInterface {
  id: string;
  name: string;
  accessToken: string;
  tokenExpiry?: string;
  remainingTime?: number;
}

export interface instagramChannelInterface {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  instagramId: string;
  instagramUsername: string;
  instagramName: string;
  profilePictureUrl: string;
  tokenExpiry?: string;
  remainingTime?: number;
}

export interface linkedinChannedInterface {
  name: string;
  accountType: string;
  urn?: string;
  accessToken: string;
  accountId: string;
  firstName?: string;
  lastName?: string;
  tokenExpiry?: string;
  remainingTime?: number;
  url: string;
}

export interface xChannelInterface {
  name: string;
  username: string;
  accessToken: string;
  userId: string;
  isPersonal: boolean;
  refreshToken?: string;
  tokenExpiry?: string;
  remainingTime?: number;
  v1aAccessToken?: string;
  v1aAccessSecret?: string;
}

export const connectFacebook = mutation({
  args: {
    collectionId: v.id('collection'),
    facebookChannel: v.object({
      id: v.string(),
      name: v.string(),
      accessToken: v.string(),
      tokenExpiry: v.optional(v.string()),
      remainingTime: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const { collectionId, facebookChannel } = args;
    const updatedFields: {
      facebook?: facebookChannelInterface;
      updatedAt: string;
    } = {
      facebook: facebookChannel,
      updatedAt: new Date().toISOString(),
    };
    // Connect the Facebook channel to the collection
    await ctx.db.patch(collectionId, updatedFields);

    // Return the newly created Facebook channel
    return { ...facebookChannel };
  },
});

export const connectInstagram = mutation({
  args: {
    collectionId: v.id('collection'),
    instagramChannel: v.object({
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
  },
  handler: async (ctx, args) => {
    const { collectionId, instagramChannel } = args;
    const updatedFields: { collectionId: string; instagram?: instagramChannelInterface; updatedAt: string } = {
      collectionId,
      instagram: instagramChannel,
      updatedAt: new Date().toISOString(),
    };
    await ctx.db.patch(collectionId, updatedFields);
    return { ...instagramChannel };
  },
});

export const connectLinkedIn = mutation({
  args: {
    collectionId: v.id('collection'),
    linkedInChannel: v.object({
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
  },
  handler: async (ctx, args) => {
    const { collectionId, linkedInChannel } = args;
    const updatedFields: { collectionId: string; linkedin?: linkedinChannedInterface } = {
      collectionId,
      linkedin: linkedInChannel,
    };
    await ctx.db.patch(collectionId, updatedFields);
    return { ...linkedInChannel };
  },
});

export const connectX = mutation({
  args: {
    collectionId: v.id('collection'),
    xChannel: v.object({
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
  },
  handler: async (ctx, args) => {
    const { collectionId, xChannel } = args;
    const collection = await ctx.db.get(args.collectionId as Id<'collection'>);
    if (collection && !collection.tox) {
      await refreshXFunc(collectionId);
    }
    const updatedFields: { collectionId: string; tox: boolean; x?: xChannelInterface; updatedAt: string } = {
      collectionId,
      tox: true,
      x: xChannel,
      updatedAt: new Date().toISOString(),
    };
    await ctx.db.patch(collectionId, updatedFields);
  },
});

export const connectXV1 = mutation({
  args: {
    collectionId: v.id('collection'),
    xV1: v.object({
      v1aAccessToken: v.optional(v.string()),
      v1aAccessSecret: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { collectionId, xV1 } = args;
    const collection = await ctx.db.get(args.collectionId as Id<'collection'>);
    const x = collection?.x;
    if (x) {
      x.v1aAccessToken = xV1.v1aAccessToken;
      x.v1aAccessSecret = xV1.v1aAccessSecret;
      await ctx.db.patch(collectionId, { x, updatedAt: new Date().toISOString() });
    }
  },
});
