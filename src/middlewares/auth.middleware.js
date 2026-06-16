// This middleware will only verify that user exists or not

import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'


export const verifyJWT  = asyncHandler(async (req, _ ,next) => {
   try {
    // By using app.use(cookieParser()) now we have the access of req.cookies
    // we can either get the token from cookies or from header
    // For more : https://jwt.io/introduction
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    // we're getting this accessToken because we've injected it while logging in the user res.cookie("accessToken")
    if(!token){
        throw new ApiError(401, "Unauthorized request")
    }

    // Now, if the token exists then decode the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id).select("-password")

    if(!user){
        throw new ApiError(401, "Invalid Access Token")
    }

    // Now if the user with this access token exists and is in the database then save it in the request object like this
    req.user = user
    next()
   } 
   catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
   }


})