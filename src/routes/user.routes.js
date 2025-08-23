import { Router } from "express";
import { generateTokens, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
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

router.route("/refreshToken").post(generateTokens)

export default router;