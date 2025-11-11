import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

// Query to list all numbers
export const listNumbers = query({
  args: {},
  handler: async (ctx) => {
    const numbers = await ctx.db.query('numbers').order('asc').collect();
    return numbers;
  },
});

// Mutation to add a number
export const addNumber = mutation({
  args: {
    value: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('numbers', {
      value: args.value,
    });
    return id;
  },
});