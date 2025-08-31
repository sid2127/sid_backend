import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new mongoose.Schema(
    {
        title: {
            type: String
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        vedios: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "video"
            }
        ]
    },{timestamps: true}
);

playlistSchema.plugin(mongooseAggregatePaginate);

export const Playlist = mongoose.model("Playlist" , playlistSchema)