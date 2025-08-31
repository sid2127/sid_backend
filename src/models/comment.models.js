import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const commentSchema = new mongoose.Schema(
    {
        title: {
            type: String
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "video"
        }
    },{timestamps: true}
)

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment" , commentSchema)