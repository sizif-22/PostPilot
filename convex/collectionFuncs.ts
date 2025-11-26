import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { paginationOptsValidator } from 'convex/server';
import { Id } from './_generated/dataModel';

// Notification-related functions

export const getNotifications = query({
  args: {
    userId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const paginatedResult = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .paginate(args.paginationOpts);

    const { page, isDone, continueCursor } = paginatedResult;

    return {
      page,
      isDone,
      continueCursor,
    };
  },
});

// export const createNotification = mutation({
//   args: {
//     userId: v.string(),
//     type: v.union(
//       v.object({
//         name: v.literal('invitation'),
//         senderName: v.string(),
//         senderEmail: v.string(),
//         collectionId: v.id('collection'),
//         collectionName: v.string(),
//         role: v.string(),
//       }),
//       v.object({
//         name: v.literal('announcement'),
//         title: v.string(),
//         message: v.string(),
//       }),
//     ),
//   },
//   handler: async (ctx, args) => {
//     let notificationData: any = {
//       userId: args.userId,
//       type: args.type.name,
//       isRead: false,
//       createdAt: new Date().toISOString(),
//     };

//     if (args.type.name === 'invitation') {
//       notificationData = {
//         ...notificationData,
//         senderName: args.type.senderName,
//         senderEmail: args.type.senderEmail,
//         collectionId: args.type.collectionId,
//         collectionName: args.type.collectionName,
//         role: args.type.role,
//       };
//     } else if (args.type.name === 'announcement') {
//       notificationData = {
//         ...notificationData,
//         title: args.type.title,
//         message: args.type.message,
//       };
//     }

//     // const notificationId = await ctx.db.insert('notifications', notificationData);
//     // return notificationId;
//   },
// });

export const updateNotification = mutation({
  args: {
    notificationId: v.id('notifications'),
    isRead: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const updates: any = {};
    if (args.isRead !== undefined) {
      updates.isRead = args.isRead;
    }

    await ctx.db.patch(args.notificationId, updates);
  },
});

export const deleteNotification = mutation({
  args: {
    notificationId: v.id('notifications'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
  },
});

export const markAllNotificationsAsRead = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all unread notifications for the user
    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_and_read_status', (q) => q.eq('userId', args.userId).eq('isRead', false))
      .collect();

    // Update each notification to mark as read
    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

// Other existing functions...
export const getCollectionsPaginated = query({
  // Validators for arguments.
  args: {
    userId: v.string(),
    paginationOpts: paginationOptsValidator,
  },

  // Query implementation.
  handler: async (ctx, args) => {
    if (!args.userId) {
      return {
        page: [],
        isDone: true,
      };
    }
    const paginatedResult = await ctx.db
      .query('user_collection')
      .withIndex('by_user_and_updated', (q) => q.eq('userId', args.userId))
      .order('desc')
      .paginate(args.paginationOpts);

    const { page, isDone, continueCursor } = paginatedResult;

    // Process the results to include collection details
    const collectionsWithRole = await Promise.all(
      page.map(async (uc) => {
        const collection = await ctx.db.get(uc.collectionId);
        return {
          ...uc,
          collectionName: collection?.name || '',
          collectionDescription: collection?.description || '',
          updatedAt: uc.updatedAt || collection?.updatedAt || collection?._creationTime || '', // Prioritize user_collection updatedAt
          // Add any other collection fields you need
        };
      }),
    );

    // Return paginated result with cursor info
    return {
      page: collectionsWithRole,
      isDone,
      continueCursor,
    };
  },
});

export const createCollection = mutation({
  // Validators for arguments.
  args: {
    name: v.string(),
    description: v.string(),
    userId: v.string(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    const collectionId = await ctx.db.insert('collection', {
      name: args.name,
      tox: false,
      description: args.description,
      updatedAt: new Date().toISOString(),
    });

    await ctx.db.insert('user_collection', {
      collectionId: collectionId,
      userId: args.userId,
      role: 'Owner',
      updatedAt: new Date().toISOString(),
    });

    console.log('Added new collection with id:', collectionId);
    // Optionally, return a value from your mutation.
    // return collectionId;
  },
});

export const updateCollection = mutation({
  // Validators for arguments.
  args: {
    collectionId: v.id('collection'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    const { collectionId, name, description } = args;
    const collection = await ctx.db.get(collectionId);
    if (!collection) {
      throw new Error('Collection not found');
    }

    const updatedFields: { name?: string; description?: string; updatedAt: string } = {
      updatedAt: new Date().toISOString(),
    };
    if (name !== undefined) updatedFields.name = name;
    if (description !== undefined) updatedFields.description = description;

    await ctx.db.patch(collectionId, updatedFields);

    // Update the updatedAt field in all related user_collection records
    // Find all user_collection records for this collection
    const userCollectionRecords = await ctx.db
      .query('user_collection')
      .withIndex('by_collectionId', (q) => q.eq('collectionId', collectionId))
      .collect();

    for (const record of userCollectionRecords) {
      await ctx.db.patch(record._id, {
        updatedAt: new Date().toISOString(),
      });
    }
  },
});
// Function to accept a collection invitation
export const acceptCollectionInvitation = mutation({
  args: {
    notificationId: v.id('notifications'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the notification
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== args.userId) {
      throw new Error('Notification not found or unauthorized');
    }

    if (notification.type !== 'invitation') {
      throw new Error('Cannot accept non-invitation notification');
    }

    // Check if collectionId exists before inserting
    if (!notification.collectionId) {
      throw new Error('Collection ID not found in notification');
    }

    // Add the user to the collection with the specified role
    await ctx.db.insert('user_collection', {
      collectionId: notification.collectionId,
      userId: args.userId,
      role: notification.role || 'Contributor', // Default to Contributor if role is undefined
      updatedAt: new Date().toISOString(),
    });

    // Mark the notification as read (or delete it)
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

// Function to reject a collection invitation
// export const rejectCollectionInvitation = mutation({
//   args: {
//     notificationId: v.id('notifications'),
//     userId: v.string(),
//   },
//   handler: async (ctx, args) => {
//     // Get the notification
//     const notification = await ctx.db.get(args.notificationId);
//     if (!notification || notification.userId !== args.userId) {
//       throw new Error('Notification not found or unauthorized');
//     }

//     if (notification.type !== 'invitation') {
//       throw new Error('Cannot reject non-invitation notification');
//     }

//     // Mark the notification as read (or delete it)
//     await ctx.db.patch(args.notificationId, { isRead: true });
//   },
// });

// Function to get a collection by its ID

export const getCollectionById = query({
  args: {
    id: v.string(),
  },

  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.id as Id<'collection'>);

    return collection;
  },
});

export const getRecentCollections = query({
  args: {
    userId: v.string(),
  },

  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    const recentCollections = await ctx.db

      .query('user_collection')

      .withIndex('by_user_and_updated', (q) => q.eq('userId', args.userId))

      .order('desc')

      .take(3);

    return Promise.all(
      recentCollections.map(async (uc) => {
        const collection = await ctx.db.get(uc.collectionId);

        return {
          ...collection,

          ...uc,
        };
      }),
    );
  },
});

export const deleteCollection = mutation({
  args: {
    collectionId: v.id('collection'),
  },
  handler: async (ctx, args) => {
    const userCollections = await ctx.db
      .query('user_collection')
      .withIndex('by_collectionId', (q) => q.eq('collectionId', args.collectionId))
      .collect();

    for (const uc of userCollections) {
      await ctx.db.delete(uc._id);
    }

    await ctx.db.delete(args.collectionId);
  },
});

export const getTeamMembers = query({
  args: {
    collectionId: v.id('collection'),
  },
  handler: async (ctx, args) => {
    const userCollections = await ctx.db
      .query('user_collection')
      .withIndex('by_collectionId', (q) => q.eq('collectionId', args.collectionId))
      .collect();

    const teamMembers = await Promise.all(
      userCollections.map(async (uc) => {
        const user = await ctx.db
          .query('users')
          .withIndex('by_userId', (q) => q.eq('userId', uc.userId))
          .first();
        return {
          ...uc,
          user,
        };
      }),
    );

    return teamMembers;
  },
});

export const updateMemberRole = mutation({
  args: {
    collectionId: v.id('collection'),
    userId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const userCol = await ctx.db
      .query('user_collection')
      .withIndex('by_collectionId', (q) => q.eq('collectionId', args.collectionId))
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .first();

    if (!userCol) {
      throw new Error('User not found in collection');
    }

    await ctx.db.patch(userCol._id, { role: args.role });
  },
});

export const removeMember = mutation({
  args: {
    collectionId: v.id('collection'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userCol = await ctx.db
      .query('user_collection')
      .withIndex('by_collectionId', (q) => q.eq('collectionId', args.collectionId))
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .first();

    if (!userCol) {
      throw new Error('User not found in collection');
    }

    await ctx.db.delete(userCol._id);
  },
});

export const getMyMembership = query({
  args: {
    collectionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const collectionId = ctx.db.normalizeId('collection', args.collectionId);
    if (!collectionId) {
      return null;
    }

    const userId = identity.subject;

    const userCol = await ctx.db
      .query('user_collection')
      .withIndex('by_collectionId', (q) => q.eq('collectionId', collectionId))
      .filter((q) => q.eq(q.field('userId'), userId))
      .first();

    return userCol;
  },
});
