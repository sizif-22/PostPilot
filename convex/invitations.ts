import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createInvitation = mutation({
    args: {
        email: v.string(),
        collectionId: v.id('collection'),
        invitedBy: v.string(), // userId
        role: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if invitation already exists
        const existingInvitation = await ctx.db
            .query('invitations')
            .withIndex('by_collectionId', (q) => q.eq('collectionId', args.collectionId))
            .filter((q) => q.eq(q.field('email'), args.email))
            .first();

        if (existingInvitation) {
            // If pending, maybe resend? For now just return it.
            if (existingInvitation.status === 'pending') {
                return existingInvitation._id;
            }
        }

        const invitationId = await ctx.db.insert('invitations', {
            email: args.email,
            collectionId: args.collectionId,
            role: args.role,
            status: 'pending',
            invitedBy: args.invitedBy,
            createdAt: new Date().toISOString(),
        });

        // Try to find the user by email to create a notification
        const invitedUser = await ctx.db
            .query('users')
            .withIndex('by_email', (q) => q.eq('email', args.email))
            .first();

        if (invitedUser) {
            // Get collection details for the notification
            const collection = await ctx.db.get(args.collectionId);
            // Get inviter details
            const inviter = await ctx.db
                .query('users')
                .withIndex('by_userId', (q) => q.eq('userId', args.invitedBy))
                .first();

            // await ctx.db.insert('notifications', {
            //     userId: invitedUser.userId,
            //     type: 'invitation',
            //     senderName: inviter?.name || 'Someone',
            //     senderEmail: inviter?.email || '',
            //     collectionId: args.collectionId,
            //     collectionName: collection?.name || 'Unknown Collection',
            //     role: args.role,
            //     isRead: false,
            //     createdAt: new Date().toISOString(),
            // });
        }

        return invitationId;
    },
});

export const getInvitations = query({
    args: {
        collectionId: v.id('collection'),
    },
    handler: async (ctx, args) => {
        const invitations = await ctx.db
            .query('invitations')
            .withIndex('by_collectionId', (q) => q.eq('collectionId', args.collectionId))
            .order('desc')
            .collect();
        return invitations;
    },
});

export const acceptInvitation = mutation({
    args: {
        invitationId: v.id("invitations"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.invitationId);
        if (!doc) {
            throw new Error('Notification or Invitation not found');
        }

        await ctx.db.insert('user_collection', {
            collectionId: doc.collectionId,
            userId: args.userId,
            role: doc.role,
            updatedAt: new Date().toISOString(),
        });

        await ctx.db.delete(args.invitationId);

    },
});

export const rejectInvitation = mutation({
    args: {
        invitationId: v.id("invitations"), // Changed to string to accept both ID types
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.invitationId);
        if (!doc) {
            throw new Error('Notification or Invitation not found');
        }

        await ctx.db.delete(args.invitationId);
    },
});

export const updateInvitationRole = mutation({
    args: {
        invitationId: v.id('invitations'),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.invitationId, { role: args.role });
    },
});

export const deleteInvitation = mutation({
    args: {
        invitationId: v.id('invitations'),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.invitationId);
    },
});

export const getMyInvitations = query({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const invitations = await ctx.db
            .query('invitations')
            .filter((q) => q.eq(q.field('email'), args.email))
            .filter((q) => q.eq(q.field('status'), 'pending'))
            .collect();

        // Enrich with details
        const enrichedInvitations = await Promise.all(
            invitations.map(async (inv) => {
                const collection = await ctx.db.get(inv.collectionId);
                const inviter = await ctx.db
                    .query('users')
                    .withIndex('by_userId', (q) => q.eq('userId', inv.invitedBy))
                    .first();

                return {
                    ...inv,
                    collectionName: collection?.name || 'Unknown Collection',
                    senderName: inviter?.name || 'Someone',
                    senderEmail: inviter?.email || '',
                };
            })
        );

        return enrichedInvitations;
    },
});
