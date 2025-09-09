import { Router } from "express";
import {verifyJwt} from "../middlewares/authentication.middleware.js"
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
const router = Router();

router.use(verifyJwt)

router.route("/createPlaylist").post(createPlaylist);

router.route("/userPlaylist/:userId").get(getUserPlaylists);

router.route("/:playlistId").get(getPlaylistById).delete(deletePlaylist).patch(updatePlaylist)

router.route("/:playlistId/video/:videoId").post(addVideoToPlaylist).delete(removeVideoFromPlaylist)





export default router;