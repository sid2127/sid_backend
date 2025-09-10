import mongoose, { Aggregate, isValidObjectId } from "mongoose";
import { asynchandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/Subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//toogle subcription

const toogleSubscription = asynchandler(async (req, res) => {

    const { channelId } = req.params;

    if (!(isValidObjectId(channelId))) {
        throw new ApiError(400, "Invalid Channel Id");
    }

    const subscription = await Subscription.findOne({ subscriber: req.user._id, channel: channelId });

    if (subscription) {
        await subscription.deleteOne();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Unsubscribed sucessfully"
                )
            )
    }
    else {
        const newSubscription = await Subscription.create({ subscriber: req.user._id, channel: channelId })

        if (!newSubscription) {
            throw new ApiError(400, "Error while storing subscription in db");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    newSubscription,
                    "Subscribed sucessfully"
                )
            )
    }
})

//getSubscribersOfChannelList

const getChannelSubscribers = asynchandler(async (req, res) => {

    const { channelId } = req.params;

    if (!(isValidObjectId(channelId))) {
        throw new ApiError(400, "Invalid channel Id");
    }

    const AllChannelSubscriber = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
            $unwind: "$subscriber"
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,
            AllChannelSubscriber,
            "All subscriber fetched sucessfully"
        )
    )

})

//GetAllSubscribes To Channel of user

const getSubscribesToChannel = asynchandler(async (req, res) => {

    const { userId } = req.params;

    if (!(isValidObjectId(userId))) {
        throw new ApiError(400, "Invalid channel Id");
    }

    const AllSubscribesTo = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
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
            $unwind: "$channel"
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,
            AllSubscribesTo,
            "All subscriber fetched sucessfully"
        )
    )

})


export { toogleSubscription , getChannelSubscribers , getSubscribesToChannel }