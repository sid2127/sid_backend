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
import TweetRouter from "./routes/tweet.routes.js"
import PlaylistRouter from "./routes/playlist.routes.js"

//route declaration

app.use("/api/v1/user" , UserRouter);

//http://localhost:8000/api/v1/user/registration

app.use("/api/v1/videos" , VideoRouter)

app.use("/api/v1/tweet" , TweetRouter)

app.use("/api/v1/playlist" , PlaylistRouter)

export {app}