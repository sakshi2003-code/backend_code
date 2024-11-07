import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from"../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

import jwt from  "jsonwebtoken"
// method for access token and refresh token 

const generateAccessAndRefreshToken = async(userId)=>{
    try {
     const user=   await User.findById(userId)
    const accessToken=  await user.generateAccessToken()
    const refreshToken=  await user.generateRefreshToken()
    //  console.log("accessToken", accessToken);
    //  console.log(" refreshToken", refreshToken);
     

    // ye mongodb m store krne ke liye
    user.refreshToken=refreshToken
    // save krte time validation ke liye password dene ki jarurat nhi h
    // merko pta h m kya kr ra hu iske liye validateBeforeSave
  await  user.save({validateBeforeSave:false})
  return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,
            "Something went wrong while generating refresh and access token")
    }
}




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
// const coverImageLocalPath =req.files?.coverImage[0]?.path;

let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) 
    && req.files.coverImage.length > 0){

        coverImageLocalPath=req.files.coverImage[0].path
}





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

const loginUser=asyncHandler(async (req,res)=>{
// req body -> data
// username or email 
// find the user
// password check
// access and refresh token
// send cookie 


// req body -> data
const {email, username , password }= req.body
console.log(req.body);


// username or email
// if(!(username   || email))
    
    
if(!username  && !email){
   
    throw new ApiError(400, "username or password is requiered")
}

// find the user
const user = await  User.findOne({
    $or:[{username},{email} ]
})


console.log(user);


if(!user){
    throw new ApiError(404 , "user does not Exists")
}

// password check

 const isPasswordValid = await user.isPasswordCorrect(password)

 if(!isPasswordValid){
    throw new ApiError(401 , "invalid user credentials")
}

// access and refresh token
// jb b db calls khi ho ri hoti h to usme time lgta h isliye hme await ka use krna chaiye udhr
const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

// send cookie
// yha pe hm cookie isliye use kr pa re kyuki hmne app.js m cookie-parser ka use kr rkha

   const loggedInUser  =await User.findById(user._id)
   .select("-password  -refreshToken" )

//    cookie option m jb hm httponly true krte hn to bss server hi ise modify kr skta h
// security rehti h is se
   const options ={
    httpOnly:true,
    secure:true
   }



   return res.status(200).
   cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)

//    ye json response isliye bhej re agr use ko apni localstorage m store krwana ho to 
.json(
    new ApiResponse(
        200,
        {
            user:loggedInUser , accessToken,
            refreshToken
       
        },"user logged In Successfully"
    )
)
})
 
// create middleware
// kyuki hmne middleware ka use krke route m user add krwa rkha h isliye hmpe req.user ka access h
const logoutUser = asyncHandler(async(req , res) =>{
    
    
  await User.findByIdAndUpdate(
    req.user._id,
    {
        $unset:{
            refreshToken:1
        }
    },
        {
            new:true
        }
    
)

const options ={
    httpOnly:true,
    secure:true
   }


return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"user logged out"))


}
)

// endpoint controller for user refresh token

const refreshAccessToken= asyncHandler(async(req , res)=>{
    // agr phone use kr ra hoga to wo body m refresh token bhejega
 const incomingRefreshToken= req.cookies.refreshToken  || req.body.refreshToken 

 if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorize request")
 }
// user ke pass jo refresh token jata h wo encrypted hota h 
// hme jo chaiye wo row data chaiye isliye jwt ki jarurat h yha pe
// payload optional hota h jaruri ni h hmesa mile
try {
    const decodedToken=jwt.verify(
        incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
    )
    
    
    const user=await User.findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401,"Unauthorize request")
     }
    if(incomingRefreshToken !==user?.refreshToken){
        throw new ApiError(401,"Refresh token is expired or used")
    }
    
    const options ={
      httpOnly:true,
      secure:true  
    }
    
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse(
            200,{
                accessToken,
                refreshToken:newRefreshToken
            }
            ,"Access token refreshed successfully" 
        )
    )
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token")
}

})

const changeCurrentPassword =asyncHandler(async(req ,res)=>{
    const {oldPassword,newPassword} =req.body
  
    //  if(!(newPassword === confPassword)){
    //     // throw error
    //  }


   const user=  await User.findById(req.user?._id)
    consst isPasswordCorrect =await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old Password ");
        
    }
   user.password=newPassword
   await user.save({validateBeforeSave:false})

   return res
   .status(200),
   .json(new ApiResponse(200,{},"Password changed successfully"))
 
})

const getCurrentUser =asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(200,req.user , "Current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req ,res)=>{
    const {fullName , email} =req.body

     if ( !fullName || !email) {
        throw new ApiError(400 ,"All fields are required");
        }

   const user=  User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email:email
            }
        },
        {new : true}
    ).select("-password")


    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Account details updated succesfully"))


})


const updateUserAvatar =asyncHandler(async(req , res)=>{
  const avatarLocalPath=  req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is missing")
  }

 const avatar=await uploadOnCloudinary(avatarLocalPath)

 if(!avatar.url){
    throw new ApiError(400," Error while uploading on Avatar ")
 }
 const user=User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            avatar:avatar.url
        }
    },
    {new : true}
).select("-password")

return res
.status(200)
.json(new ApiResponse(200 , user , "Avatar updated succesfully"))

})


const updateUserCoverImage =asyncHandler(async(req , res)=>{
    const coverImageLocalPath=  req.file?.path
  
    if(! coverImageLocalPath){
      throw new ApiError(400,"coverImage file is missing")
    }
  
   const coverImage=await uploadOnCloudinary( coverImageLocalPath)
  
   if(!coverImage.url){
      throw new ApiError(400," Error while uploading on Avatar ")
   }
   const user=User.findByIdAndUpdate(
      req.user?._id,
      {
          $set:{
            coverImage:coverImage.url
          }
      },
      {new : true}
  ).select("-password")
  
  return res
  .status(200)
  .json(new ApiResponse(200 , user , " cover Image updated succesfully"))
  
  })

export {registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage
}
