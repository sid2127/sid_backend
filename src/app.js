import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))

app.use(urlencoded({extended: true , limit: "16kb"}))

app.use(express.static("public"))

app.use(cookieParser())


//route import

import UserRouter from "./routes/user.routes.js"
import VideoRouter from "./routes/video.routes.js"

//route declaration

app.use("/api/v1/user" , UserRouter);

//http://localhost:8000/api/v1/user/registration

app.use("/api/v1/videos" , VideoRouter)

export {app}