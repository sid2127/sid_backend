import mongoose, { Mongoose } from "mongoose";
import { asynchandler } from "../utils/asyncHandler.js";
import { Like } from "../models/likes.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

//toogle video like

const toogleVideoLike = asynchandler(async (req, res) => {

    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "videoId is not given");
    }

    const likedvideo = await Like.findOne({ video: videoId, LikedBy: req.user._id });

    if (likedvideo) {      //if already liked, then unlike
        await likedvideo.deleteOne()
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "unliked sucessfully"
                )
            )
    }
    else {
        const newlike = await Like.create({
            LikedBy: req.user._id,
            video: videoId
        })

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    newlike,
                    "liked sucessfully"
                )
            )
    }

})

//toogle comment like

const toogleCommentLike = asynchandler(async (req, res) => {

    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "No commentId given");
    }

    const commentLike = await Like.findOne({ comment: commentId, LikedBy: req.user._id });

    if (commentLike) {
        await commentLike.deleteOne();

        return res
            .status(200)
            .json(
                200,
                {},
                "unliked sucessfully"
            )
    }
    else {
        const addLike = await Like.create({ LikedBy: req.user._id, comment: commentId });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    addLike,
                    "liked sucessfully"
                )
            )
    }
})

//toogle tweet like

const toogleTweetLike = asynchandler(async (req, res) => {

    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "videoId is not given");
    }

    const likedtweet = await Like.findOne({ tweet: tweetId, LikedBy: req.user._id });

    if (likedtweet) {      //if already liked, then unlike
        await likedtweet.deleteOne()
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "unliked sucessfully"
                )
            )
    }
    else {
        const newlikedtweet = await Like.create({
            LikedBy: req.user._id,
            tweet: tweetId
        })

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    newlikedtweet,
                    "liked sucessfully"
                )
            )
    }

})

//get all liked videos 

const getAllLikedVideos = asynchandler(async (req, res) => {

    const AllLikedVideos = await Like.aggregate([
        {
            $match: {
                LikedBy: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullname: 1,
                                        thumbnail: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    if (AllLikedVideos.length === 0) {
        throw new ApiError(400, "No video liked");

    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                AllLikedVideos,
                "All liked videos fetched sucessfully"
            )
        )
})

//get all likes in particular video

const getVideoLikesCount = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "VideoId is required");
  }

  const likesCount = await Like.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse(
      200,
      likesCount,
      "Video likes count fetched successfully"
    )
  );
});




export { toogleVideoLike, toogleCommentLike, toogleTweetLike, getAllLikedVideos , getVideoLikesCount}