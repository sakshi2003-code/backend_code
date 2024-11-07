// steps after databse connection 
// in app.js 
// we create async handler in utils
// apierror.js in utils
// api response hme express se milega isliye uske liye alg se
// apiresponse.js file
// models
// utils->cloudinary 
// middlewares->multer
// controller->user.controller
// routes->routes.js
// postman download for server
// ab register user m hm frontend se request le re hn
// to hme file handling ke liye multer ka use krna pdega 
// uske liye hnm user.routes m upload import krenge 
// user.conroller m register ke liye method
// fir login ke liye method
// fir logout ke liye phle middleware auth.middleware.js
// routes m logout ke liye route add
// endpoint for user refeshtoken in user.controller.js
// add subsription.model.js in models
// controllers for updation password , email,username ,images







// require('dotenv').config ({path:'./env'})
import dotenv from "dotenv"


import mongoose from "mongoose"
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import { config } from "dotenv";
import {app} from './app.js'

dotenv.config({
    path:'./.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at Port ${process.env.PORT}`);
        app.on("error",(error)=>{
            console.log("ERROR:",error);
            throw error
            
         })
    })
})
.catch((err)=>{
    console.log("MongoDb connection failed!!!",err);

    
})


/*
import express from "express"
const app=express()

;( async ()=>{
    try {
     await   mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
     app.on("error",(error)=>{
        console.log("ERROR:",error);
        throw error
        
     })
     application.listen(process.env.PORT,()=>{
        console.log(`app is listening on port ${
            process.env.PORT
        }`);
        
     })
    } catch (error) {
        console.log("ERROR" ,error);
        throw error
        
    }
})()
    
*/