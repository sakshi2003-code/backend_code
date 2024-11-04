// require('dotenv').config ({path:'./env'})
import dotenv from "dotenv"


import mongoose from "mongoose"
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import { config } from "dotenv";

dotenv.config({
    path:'./env'
})

connectDB()


/*
import express from "express"
const app=express()

;( async ()=>{
    try {
     await   mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
     application.on("error",(error)=>{
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