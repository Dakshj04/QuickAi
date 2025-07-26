import { clerkClient } from '@clerk/express'

export const auth = async (req, res, next) => {
    try {
        const { userId, has } = await req.auth();
        const hasPremiumPlan = await has({ plan: 'premium' });
        
        const user = await clerkClient.users.getUser(userId);

        // Check if user has privateMetadata and free_usage exists
        if (!hasPremiumPlan) {
            if (user.privateMetadata && typeof user.privateMetadata.free_usage === 'number') {
                req.free_usage = user.privateMetadata.free_usage;
            } else {
                // Initialize free_usage if it doesn't exist
                await clerkClient.users.updateUserMetadata(userId, {
                    privateMetadata: {
                        ...user.privateMetadata, // Preserve existing metadata
                        free_usage: 0
                    }
                });
                req.free_usage = 0;
            }
        } else {
            req.free_usage = 0; // Premium users don't have usage limits
        }
        
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        next()
    } catch (error) {
        console.log('Auth middleware error:', error);
        res.json({ success: false, message: error.message }); 
    }
}