import mongoose from "mongoose";
import { asynchandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";

//create/add comment

const createComment = asynchandler(async (req, res) => {

    const { videoId } = req.params;
    const { title } = req.body

    if (!title) {
        throw new ApiError(400, "title is empty");
    }

    const comment = await Comment.create({ title, owner: req.user._id, video: videoId })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                "comment created sucessfully"
            )
        )
})

//read all comments of video

const getAllComments = asynchandler(async (req, res) => {

    const { videoId } = req.params;

    const AllComments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
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
                            avatar: 1
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
        },
        {
            $project: {
                title: 1,
                owner: 1
            }
        }
    ])

    if (AllComments.length === 0) {
        throw new ApiError(400, "No comments exists");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                AllComments,
                "Comments fetched sucessfully"
            )
        )
})

//update comment

const updateComment = asynchandler(async (req, res) => {

    const { commentId } = req.params;
    const { updatedComment } = req.body

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(400, "comment doesnt exist");
    }

    if (comment.owner.toString() != req.user._id.toString()) {
        throw new ApiError(400, "Comment is of different user");
    }

    comment.title = updatedComment;
    await comment.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                "Comment updated sucessfully"
            )
        )
})

//delete Comment 

const deleteComment = asynchandler(async (req, res) => {

    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "Give commentId");
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(400, "comment doesnt exist");
    }

    if (comment.owner.toString() != req.user._id.toString()) {
        throw new ApiError(400, "cannot delete comment as it is of different user");
    }

    await comment.deleteOne()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "comment deleted sucessfully"
            )
        )
})


export { createComment, getAllComments, updateComment, deleteComment }