import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from"../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser =asyncHandler(async(req,res)=>{
  
    //    steps
    // get user details frin fronend
    // validation - not empty
    // check if user already exists :usrename ,email
    // check for images , check for avatar
    // upload them to cloudinary ,avatar
    // creat user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res



    //user details
    const {fullName,email,username,password}=req.body 
   if (
    [fullName,email,username,password]
    .some((field)=>field?.trim()==="")
) {
    throw new ApiError(400,"All fields are required")
   }
   
//    check if already exists

const existedUser=await User.findOne({
    $or:[{ username },{ email }]
    // is se jitne b variable check krne hn kr skte hn 
})

 if(existedUser) {
    throw new ApiError(409,"User with email or username already exists")
 }

//  req.file multer deta h hmko
// console.log(req.files);

const avatarLocalPath=req.files?.avatar[0]?.path;
const coverImageLocalPath =req.files?.coverImage[0]?.path;

// let coverImageLocalPath;
// if(req.files && Array.isArray(req.files.coverImage) 
//     && req.files.coverImage.length > 0){

//         coverImageLocalPath=req.files.coverImage[0].path
// }





if(!avatarLocalPath){
  throw new ApiError(400,"Avatar file is required")
}
// upload to cloudinary
const avatar=await uploadOnCloudinary(avatarLocalPath)
const coverImage=await uploadOnCloudinary(coverImageLocalPath)
if(!avatar){
    throw new ApiError(400,"Avatar file is required")
}


// create object

const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
})


// remove password or user field 
// mongo db hr kisi ke sath ek unique id khud se create krta h jise _id kehte hn 
//    is select field m wo chiz lete hn jo nhi chaiye hoti 
const createdUser=await User.findById(user._id).select(
 "-password  -refreshToken"
)

if(!createdUser){
    throw new ApiError("Something went wrong while registering the user")
}

// send response

return res.status(201).json(
    new ApiResponse(200, createdUser,"user registered successfully")
)

})

export {registerUser}
