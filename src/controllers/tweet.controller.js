import mongoose, { Aggregate, get } from "mongoose";
import { asynchandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

const createTweet = asynchandler(async (req , res) =>{

    const {content} = req.body;

    if(!content){
        throw new ApiError(404 , "content is required");
        
    }

    const tweet = await Tweet.create({
        content: content,
        owner: req.user._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet created sucessfully"
        )
    )
})


//delete tweet

const deleteTweet = asynchandler(async (req , res) =>{

    const {tweetId} = req.params

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if(!tweet){
        throw new ApiError(400 , "no tweet exist with such id");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet Deleted Sucessfully"
        )
    )
    
})


//update tweet 

const updateTweet = asynchandler(async (req , res) =>{
    const {content} = req.body;
    const {tweetId} = req.params

    if(!content){
        throw new ApiError(400 , "content required");
    }

    const upadatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content
            }
        },
        {
            new: true
        }
    )

    if(!upadatedTweet){
        throw new ApiError(400 , "tweet not found with such id");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            upadatedTweet,
            "tweet updated sucessfully"
        )
    )
})


//get all tweets of user

const getUserTweets = asynchandler(async (req , res) =>{

    const {userId} = req.params;

    const allTweet = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
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
                        $project:{
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
        
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            allTweet,
            "Fetched all tweet sucessfully"
        )
    )
})


export {createTweet , deleteTweet , updateTweet , getUserTweets}