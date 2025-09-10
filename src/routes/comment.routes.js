import { Router } from "express";
import { createComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/authentication.middleware.js";

const router = Router()

router.use(verifyJwt);

router.route("/videoId/:videoId").post(createComment).get(getAllComments)

router.route("/:commentId").post(updateComment).delete(deleteComment)

export default router;