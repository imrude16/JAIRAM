import jwt from "jsonwebtoken";

import { JWT_SECRET_KEY } from "../../config/env.js";

// Handles JWT token generation for user authentication
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        JWT_SECRET_KEY,
        { expiresIn: "7d" }
    );
};

export {
    generateToken,
};

/*
IMPORTANT ---> Each HTTP request creates a NEW req object.
a) User logs in → we generate JWT token and send it to client
b) Client stores tokein in LocalStorage / Cookies and sends it in Authorization header(token) for subsequent requests
c) Authorization header(token) is sent inside HTTP request headers by client for protected routes
d) When request comes in, we have to verify the token and decode it to get user info (id, role)
e) Later user info from decoded token is attached to req.user so that it can be used in controllers to know which user made the request
*/