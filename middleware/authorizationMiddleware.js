// authzMiddleware.js

const authzMiddleware = (requiredRole) => {
    return (req, res, next) => {
        // Check if the admin is logged in and has the required role
        if (req.session.admin && req.session.admin.role === requiredRole) {
            // Admin is authorized, proceed to the next middleware
            next();
        } else {
            // Admin is not authorized, return a 403 Forbidden response
            res.status(403).send('You do not have permission to access this resource.');
        }
    };
};

module.exports = authzMiddleware;
