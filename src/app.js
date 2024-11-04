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
export {app}