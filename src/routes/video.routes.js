import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getAllVideos,publishVideo, tooglePublishedStatus, updateDetails } from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/authentication.middleware.js";



const router = Router();

router.route("/getAllVideos").get(getAllVideos);


router.route("/publishVideo").post(
    verifyJwt,
    upload.fields([
        {
            name:"video",
            maxCount: 1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    publishVideo
)

router.route("/c/:videoId").post(verifyJwt , deleteVideo)

router.route("/updateDetails/:videoId").post(
    verifyJwt,
    upload.single("thumbnail"),
    updateDetails
)

router.route("/toogleStatus/:videoId").patch(verifyJwt , tooglePublishedStatus)


export default router