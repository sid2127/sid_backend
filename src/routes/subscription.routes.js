import { Router } from "express";
import { getChannelSubscribers, getSubscribesToChannel, toogleSubscription } from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middlewares/authentication.middleware.js";

const router = Router();

router.route("/:channelId").post(verifyJwt , toogleSubscription).get(getChannelSubscribers)

router.route("/:userId").get(getSubscribesToChannel)


export default router;