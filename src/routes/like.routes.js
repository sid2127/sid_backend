import { Router } from "express";
import { getAllLikedVideos, toogleCommentLike, toogleTweetLike, toogleVideoLike } from "../controllers/likes.controller.js";
import { verifyJwt } from "../middlewares/authentication.middleware.js";

const router = Router();

router.use(verifyJwt)

router.route("/:videoId").patch(toogleVideoLike)

router.route("/:commentId").patch(toogleCommentLike)

router.route("/:tweetId").patch(toogleTweetLike)

router.route("/").get(getAllLikedVideos)

router.route("/LikedCount").get(getAllLikedVideos)

export default router;