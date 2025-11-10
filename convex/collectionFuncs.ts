import { v } from 'convex/values';
import { query, mutation, action } from './_generated/server';
import { api } from './_generated/api';

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// You can read data from the database via a query:

export const getCollections = query({
  // Validators for arguments.
  args: {
    userId: v.string(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    const userCollections = await ctx.db
      .query('user_collection')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .collect();
    
    // Fetch the collection details for each user_collection entry
    const collectionsWithRole = await Promise.all(userCollections.map(async (uc) => {
      const collection = await ctx.db.get(uc.collectionId);
      return {
        ...uc,
        collectionName: collection?.name || '',
        collectionDescription: collection?.description || '',
        // Add any other collection fields you need
      };
    }));
    
    return collectionsWithRole;
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
    const id = await ctx.db.insert('collection', {
      name: args.name,
      description: args.description,
    });

    await ctx.db.insert('user_collection', {
      collectionId: id,
      userId: args.userId,
      role: 'Owner',
    });

    console.log('Added new collection with id:', id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});
