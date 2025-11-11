import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { paginationOptsValidator } from 'convex/server';

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

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
