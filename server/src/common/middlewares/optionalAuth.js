import jwt from "jsonwebtoken";

import { AppError } from "../errors/AppError.js";
import { JWT_SECRET_KEY } from "../../config/env.js";


// This middleware is applied globally to all routes.
// This allows routes to work for both logged-in and anonymous users.
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // No token → public route → continue
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            //No authorization header
            //Or header doesn't follow "Bearer TOKEN" format
            req.user = null;
            return next();
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET_KEY);

        req.user = decoded;
         /*
            // req OBJECT WITH user(payload) ATTACHED AFTER SUCCESSFUL AUTHENTICATION
            // NOTE : user IS NOT SENT BY CLIENT, IT IS CREATED BY US AFTER DECODING THE JWT TOKEN AND ATTACHED TO req OBJECT
            // SO THAT IT CAN BE USED IN CONTROLLERS TO KNOW WHICH USER MADE THE REQUEST
            req = {
                method: "GET",
                url: "/profile?page=2",
                headers: { ...},
                query: { ...},
                params: {},
                body: {},

                user: {
                    id: "123",
                    email: "user@email.com",
                    role: "admin",
                    iat: 1711111111,
                    exp: 1711119999
                }
            };
            */
        next();

    } catch (err) {
        return next(new AppError("Invalid or expired token", 401));
    }
};

export { optionalAuth };

/*
// THIS IS HOW req OBJECT LOOKS LIKE , IT IS CREATED WHEN REQUEST COMES IN 
// LATER IS USED IN MIDDLEWARES AND CONTROLLERS TO ACCESS REQUEST DATA
req = {
  method: "GET",
  url: "/profile?page=2",
  path: "/profile",

  headers: {
    host: "localhost:5000",
    authorization: "Bearer abc.def.ghi",
    connection: "keep-alive"
  },

  query: {
    page: "2"
  },

  params: {},

  body: {},

  // many internal Express properties
  socket: {...},
  app: {...}
};
*/