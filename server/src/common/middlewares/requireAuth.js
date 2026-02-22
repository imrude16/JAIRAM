import { AppError } from "../errors/AppError.js";

//For Restricted Routes -> 
//-> Because of global already user added -> so if user there then allowed, else reject;
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return next(new AppError("Authentication required", 401));
    }
    next();
};

export { requireAuth };

/*
// FROM HERE - EXAMPLE OF HOW req.user IS POPULATED 
// IT IS CREATED WHEN REQUEST COMES IN WITH A VALID JWT TOKEN IN THE AUTHORIZATION HEADER
req = {
   body: {},
   params: {},
   query: {},
   headers: {...},
   user: {
       id: "123",
       email: "...",
       role: "admin"
   }
}
*/
