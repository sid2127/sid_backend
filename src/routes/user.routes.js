import { Router } from "express";
import { ChangePassword, generateTokens, getCurrentUser, getUserChannelProfile, loginUser, logoutUser, registerUser, updateAccountDetail, updateAvatar, updateCoverImage, UserWatchHistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/authentication.middleware.js";

const router = Router();


router.route("/registration").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(
    verifyJwt,
    logoutUser
);

router.route("/refresh-Token").post(generateTokens)

router.route("/change-Password").post(verifyJwt , ChangePassword)

router.route("/current-user").get(verifyJwt , getCurrentUser)

router.route("/update-account").patch(verifyJwt , updateAccountDetail);

router.route("/avatar").patch(verifyJwt , upload.single("avatar") , updateAvatar)

router.route("/cover-Image").patch(verifyJwt , upload.single("coverImage") , updateCoverImage);

router.route("/c/:username").get(verifyJwt , getUserChannelProfile)

router.route("/watch-history").get(verifyJwt , UserWatchHistory)

export default router;