import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


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

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment" , commentSchema)