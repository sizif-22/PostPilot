import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createSession = mutation({
    args: {
        collectionId: v.id('collection'),
    },
    handler: async (ctx, args) => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

        const sessionId = await ctx.db.insert('sessions', {
            collectionId: args.collectionId,
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            actionCount: 0,
            status: 'active',
        });

        return sessionId;
    },
});

export const getSessions = query({
    args: {
        collectionId: v.id('collection'),
    },
    handler: async (ctx, args) => {
        const sessions = await ctx.db
            .query('sessions')
            .withIndex('by_collectionId', (q) => q.eq('collectionId', args.collectionId))
            .order('desc')
            .collect();
        return sessions;
    },
});

export const validateSession = mutation({
    args: {
        sessionId: v.id('sessions'),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);
        if (!session) {
            return { valid: false, reason: 'not_found' };
        }

        if (session.status !== 'active') {
            return { valid: false, reason: 'inactive' };
        }

        const now = new Date();
        const expiresAt = new Date(session.expiresAt);

        if (now > expiresAt) {
            await ctx.db.patch(args.sessionId, { status: 'expired' });
            return { valid: false, reason: 'expired' };
        }

        if (session.actionCount >= 50) {
            await ctx.db.patch(args.sessionId, { status: 'terminated' });
            return { valid: false, reason: 'limit_reached' };
        }

        return { valid: true };
    },
});

export const incrementActionCount = mutation({
    args: {
        sessionId: v.id('sessions'),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);
        if (!session) throw new Error("Session not found");

        await ctx.db.patch(args.sessionId, {
            actionCount: session.actionCount + 1
        });
    }
})

export const terminateSession = mutation({
    args: {
        sessionId: v.id('sessions'),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.sessionId, { status: 'terminated' });
    },
});
