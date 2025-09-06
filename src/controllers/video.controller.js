import { ApiError } from "../utils/ApiError.js";
import { ApiResponse} from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { asynchandler } from "../utils/asyncHandler.js";
import {Video} from "../models/video.models.js"
import { User } from "../models/user.models.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";


//get all videos (default and with filters(by searching , sorting, by user))

const getAllVideos = asynchandler(async (req , res) =>{

    const {page = 1 , limit = 10 , query , sortBy , sortType , userId} = req.query;

    const filter = {};

    if(query){
        filter.$or = [
            {
                title: {
                    $regex: query,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: query,
                    $options: "i"
                }
            }
        ]
    }

    if(userId){
        filter.owner = new mongoose.Types.ObjectId(userId)
    }

    const skip = (page-1)* 10;

    const sortOptions = {}

    if(sortBy && sortType){
        sortOptions[sortBy] = sortType === "asc"? 1: -1
    }
    else{
        sortOptions.createdAt = -1
    }

    const videos = await Video.aggregate([
        {
            $match: filter
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
                            username : 1,
                            fullname : 1,
                            avatar: 1
                        }
                    }
                ]
            },
        },
        {
            $addFields: {
                owner:{
                    $first: "$owner"
                }
            }
        },
        {
            $sort: sortOptions
        },
        {
            $skip: Number(skip)
        },
        {
            $limit: Number(limit)
        }
    ])

    const total = await Video.countDocuments(filter);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                total,
                videos
            },
            "Videos fetched sucessfully"
        )
    )
})


//publish or upload a video

const publishVideo = asynchandler(async (req , res)=> {

    const {title , description} = req.body

    if(!(title && description)){
        throw new ApiError(401 , "title or description not available");
    }

    const vedioFileLocalPath = req.files?.video?.[0].path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

    if(!(vedioFileLocalPath && thumbnailLocalPath)){
        throw new ApiError(401 , "vedio and thumbail are required");
    }

    const video = await UploadOnCloudinary(vedioFileLocalPath);
    const thumbnail = await UploadOnCloudinary(thumbnailLocalPath);

    if(!(video && thumbnail)){
        throw new ApiError(401 , "vedio and thumbail not able to upload on cloudinary");
    }

    const videos = await Video.create({
        videoFile: video.secure_url,
        thumbnail: thumbnail.secure_url,
        title,
        description,
        duration: video.duration,
        owner: req.user._id,
        isPublished: true
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videos,
            "video published sucessfully"
        )
    )
})


//delete a video

const deleteVideo = asynchandler(async (req , res)=> {
    
    const {videoId} = req.params;

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400 , "No video found with such videoId");
    }

    //Now check wheather the owner of video and user logined is same or not

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(401 , "Not able to delete this video");
    }

    await Video.findByIdAndDelete(video);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "video deleted sucessfully"
        )
    )
})


//update video detail(thumbnail , description , title etc)

const updateDetails = asynchandler( async(req , res)=> {

    const {videoId} = req.params;

    const {title , description} = req.body;

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404 , "Video not found on db");
        
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400 , "Video is not of same user");
    }

    if(title){
        video.title = title
    }

    if(description){
        video.description = description
    }

    if(req.file){
        const thumbailUpload = await UploadOnCloudinary(req.file?.path);

        if(!thumbailUpload){
            throw new ApiError(400 , "Not able to upload on cloudinary");
        }

        video.thumbnail = thumbailUpload.secure_url;
    }

    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(
            201,
            video,
            "details updated suceesfully"
        )
    )

})


//toogle video punlish/ unpublish

const tooglePublishedStatus = asynchandler(async(req , res) =>{

    const {videoId} = req.params;

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400 , "no such video exists in db");
        
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400 , "video and user are not same");
    }

    video.isPublished = !video.isPublished;

    await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {isPublished: video.isPublished},
            "toogle/changed status sucessfully"
        )
    )

    
})

export {getAllVideos , publishVideo , deleteVideo , updateDetails , tooglePublishedStatus}