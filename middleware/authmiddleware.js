// authMiddleware.js

const authMiddleware = (req, res, next) => {
    // Check if the admin session exists
    if (req.session.admin) {
        // Admin is authenticated, redirect to the dashboard
        next()
    } else {
        // Admin is not authenticated, proceed to the next middleware
       res.redirect('/admin/login')
    }
};

module.exports = authMiddleware;
