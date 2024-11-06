import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from  "bcrypt"

// env m jwt
const userSchema = new Schema(
    {
         username:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true,
            index:true
            // agar kisi chiz ko searchable bnana h to index true kr dete hn 

         },
         email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            
            
         },
        fullName:{
            type:String,
            required:true,
           index:true,
            trim:true,
           
            
         },
        avatar:{
            type:String,  //cloudnary url
            required:true,
   
         },
        coverImage:{
            type:String,
          },
          watchHistory:[
          {
            type:Schema.Types.ObjectId,
            ref:"Video"
         }
        ]
         ,
         password:{
            type:String,
            required:   [true ,"Password is required" ]

         },
         refreshToken:{
            type:String,
          
            
            
         }
    },{timestamps:true}
)
// prehook (isme arraow ka use nhi hota kyuki this ka reference nhi hota)
userSchema.pre("save", async function (next) {
   if(!this.isModified("password")) return next(); 
   this.password=  await bcrypt.hash(this.password,10)
   next()
   // ye hr baar run ho jaega hme chaiye ki jb password field modify ho tbhi execute ho
})
// custom method 

userSchema.methods.isPasswordCorrect =async function(password) {
  return await bcrypt.compare(password,this.password)
};
userSchema.methods.generateAccessToken=function (){
  return  jwt.sign(
      {
         _id:this._id,
         email:this.email,
         username:this.username,
         fullName:this.fullName
         
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
         expiresIn:process.env.ACCESS_TOKEN_EXPIRY
      }
   )
}
userSchema.methods.generateRefreshToken=function (){
   return  jwt.sign(
      {
         _id:this._id,
         email:this.email,
         username:this.username,
         fullName:this.fullName
         
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
         expiresIn:process.env.REFRESH_TOKEN_EXPIRY
      }
   )
}
export const User = mongoose.model("User",userSchema)