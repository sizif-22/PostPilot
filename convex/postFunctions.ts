import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createPost = mutation({
    args: {
        collectionId: v.id('collection'),
        platforms: v.array(v.string()),
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
        scheduledDate: v.optional(v.string()),
        status: v.string(),
        createdBy: v.string(),
    },
    handler: async (ctx, args) => {
        const postId = await ctx.db.insert('posts', {
            collectionId: args.collectionId,
            platforms: args.platforms,
            content: args.content,
            media: args.media,
            scheduledDate: args.scheduledDate,
            status: args.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: args.createdBy,
        });
        return postId;
    },
});

export const updatePost = mutation({
    args: {
        postId: v.id('posts'),
        platforms: v.optional(v.array(v.string())),
        content: v.optional(
            v.object({
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
        ),
        media: v.optional(
            v.array(
                v.object({
                    url: v.string(),
                    name: v.string(),
                    isVideo: v.boolean(),
                }),
            ),
        ),
        scheduledDate: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { postId, ...updates } = args;
        await ctx.db.patch(postId, {
            ...updates,
            updatedAt: new Date().toISOString(),
        });
    },
});

export const deletePost = mutation({
    args: {
        postId: v.id('posts'),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.postId);
    },
});

export const getPosts = query({
    args: {
        collectionId: v.id('collection'),
    },
    handler: async (ctx, args) => {
        const posts = await ctx.db
            .query('posts')
            .withIndex('by_collectionId', (q) =>
                q.eq('collectionId', args.collectionId),
            )
            .collect();
        return posts;
    },
});
