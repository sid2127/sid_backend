import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema(
    {
        LikedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "video"
        },
        tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tweet"
        },
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    },{timestamps: true}
)

export const Comment = mongoose.model("Comment" , commentSchema)