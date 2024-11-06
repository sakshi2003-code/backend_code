import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

// cookie-parser=> server se user ke browser ki cookie set kr ske or use b kr ske .
const app =express() 
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}
    
))

// setting for json 
// taki express json format le ske
// phle body-parser ka use krna pdta tha

// jb form submit hone pe data aata h
app.use(express.json({limit:"16kb"}))
// jb url se data aaye

app.use(express.urlencoded({extended:true,
    limit:"16kb"
}))
// folder jha static files wagera store krwani ho
app.use(express.static("public"))
app.use(cookieParser())


// router import 
import userRouter from "./routes/user.routes.js"


// routes declartion 
// routes or controller ek jgah pe ni hn isliye inke liye middleware lana pdega to app.get use ni kr skte direct

app.use("/api/v1/users",userRouter)
// http://localhost:8000/api/v1/users/register
export {app}