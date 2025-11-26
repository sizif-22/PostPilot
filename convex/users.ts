import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const syncUser = mutation({
    args: {
        userId: v.string(),
        name: v.string(),
        email: v.string(),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query('users')
            .withIndex('by_userId', (q) => q.eq('userId', args.userId))
            .first();

        let userRecordId;

        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                name: args.name,
                email: args.email,
                image: args.image,
            });
            userRecordId = existingUser._id;
        } else {
            userRecordId = await ctx.db.insert('users', {
                userId: args.userId,
                name: args.name,
                email: args.email,
                image: args.image,
            });
        }

        // Check for pending invitations for this email
        const pendingInvitations = await ctx.db
            .query('invitations')
            .filter((q) => q.eq(q.field('email'), args.email))
            .filter((q) => q.eq(q.field('status'), 'pending'))
            .collect();

        for (const invitation of pendingInvitations) {
            // Check if notification already exists
            const existingNotification = await ctx.db
                .query('notifications')
                .withIndex('by_user', (q) => q.eq('userId', args.userId))
                .filter((q) => q.eq(q.field('type'), 'invitation'))
                .filter((q) => q.eq(q.field('collectionId'), invitation.collectionId))
                .first();

            if (!existingNotification) {
                // Get collection details
                const collection = await ctx.db.get(invitation.collectionId);
                // Get inviter details
                const inviter = await ctx.db
                    .query('users')
                    .withIndex('by_userId', (q) => q.eq('userId', invitation.invitedBy))
                    .first();

                // await ctx.db.insert('notifications', {
                //     userId: args.userId,
                //     type: 'invitation',
                //     senderName: inviter?.name || 'Someone',
                //     senderEmail: inviter?.email || '',
                //     collectionId: invitation.collectionId,
                //     collectionName: collection?.name || 'Unknown Collection',
                //     role: invitation.role,
                //     isRead: false,
                //     createdAt: new Date().toISOString(),
                // });
            }
        }

        return userRecordId;
    },
});

export const getUser = query({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query('users')
            .withIndex('by_userId', (q) => q.eq('userId', args.userId))
            .first();
        return user;
    },
});
