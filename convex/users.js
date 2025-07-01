import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateUser = mutation({
    args: {
        name: v.string(), 
        email: v.string(),
        picture: v.string(), 
        uid: v.string()
    }, 
    handler: async(ctx, args) => { 
        // Check if user already exists
        const existingUser = await ctx.db.query('users')
            .filter((q) => q.eq(q.field('email'), args.email))
            .collect();
        
        // If user exists, return them
        if (existingUser?.length > 0) {
            return existingUser[0];
        }
        
        // Create new user with default token
        const newUser = {
            name: args.name,
            picture: args.picture,
            email: args.email,
            uid: args.uid,
            token: 50000
        };
        
        const userId = await ctx.db.insert('users', newUser);
        const createdUser = await ctx.db.get(userId);
        
        return createdUser;
    } 
});

export const GetUser = query({
    args: {
        email: v.string() 
    },
    handler: async(ctx, args) => {
        const user = await ctx.db.query('users')
            .filter((q) => q.eq(q.field('email'), args.email))
            .collect();
        return user[0]; 
    }
});

export const UpdateToken = mutation({
    args: {
        token: v.number(), 
        userId: v.id('users')
    },
    handler: async(ctx, args) => {
        // Get current user to check existing token
        const user = await ctx.db.get(args.userId);
        const currentToken = user?.token || 50000; // Default to 50000 if no token exists
        
        // Calculate new token value, ensuring it's a valid number
        const newToken = isNaN(args.token) ? currentToken : Math.max(0, args.token);
        
        const result = await ctx.db.patch(args.userId, {
            token: newToken 
        }); 
        return result; 
    }
});