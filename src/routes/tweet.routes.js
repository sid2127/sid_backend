import { Router } from "express";
import { verifyJwt } from "../middlewares/authentication.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";
import { updateAccountDetail } from "../controllers/user.controller.js";

const router = Router();

router.use(verifyJwt)

router.route("/postTweet").post(createTweet)

router.route("/:tweetId").delete(deleteTweet).patch(updateTweet)

router.route("/getAllTweets/:userId").get(getUserTweets)

export default router;