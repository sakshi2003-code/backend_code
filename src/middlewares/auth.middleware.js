// ye logout ke liye hmne middleware design kri h jo bolti h jate hue mujse milte hue jana 
import { ApiError } from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

// user hme header m "authorization m Bearer<Token> krke bhejta h to hme bs token chaiye to replace kr diya bearer ko ""
export const verifyJWT= asyncHandler(async(req,_, next)=>{
try {
       const token = req.cookies?. accessToken || req.header("Authorization")?.replace("Bearer ","")
             
        // console.log(req.cookies);

        if(!token){
            throw new ApiError(401 , "Unauthorizes request")
        }
       const decodedToken =  jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
      const user= await User.findById(decodedToken?._id)
       .select("-password -refreshToken")
    
       if(!user){
        throw new ApiError(401,"Invalid Access Token")
       }
    
     req.user=user;
     next()
    //  next mtlb agr koi dusra kaam h to
} catch (error) {
    throw new ApiError(401 , error?.message || "Invalid access token")
}


})