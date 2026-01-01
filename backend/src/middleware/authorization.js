/**
 * Middleware to check if the authenticated user has admin privileges.
 * Requires the authenticate middleware to run first (to populate req.user).
 */
export const authorizeAdmin = (req, res, next) => {
    // Check if req.user was populated and if the user is an admin
    const isAdmin = req.user && req.user.is_admin;
    if (!req.user || !req.user.is_admin) {
        // 403 Forbidden indicates the user is logged in but doesn't have permission
        console.log('Authorization failed: User is not an admin.', req.user);
        return res.status(403).json({ error: `Forbidden. Admin access required. ${isAdmin}` });
    }
    next(); // User is an admin, proceed
};

/**
 * Middleware to check if the authenticated user is the owner of the resource.
 * This is useful for users updating their own carts or profiles.
 * Requires the authenticate middleware to run first (to populate req.user).
 */
export const authorizeOwner = (req, res, next) => {
    // The resource ID is typically expected in the route parameter (e.g., /users/:id)
    const resourceUserId = parseInt(req.params.id, 10);

    // If the authenticated user is not the owner AND is not an admin, deny access
    if (req.user.id !== resourceUserId && !req.user.is_admin) {
        return res.status(403).json({ error: 'You are not authorized to modify this resource.' });
    }
    next();
};
