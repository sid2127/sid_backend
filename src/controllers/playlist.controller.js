import mongoose from "mongoose";
import { asynchandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";

const createPlaylist = asynchandler(async (req, res) => {

    const { title, description } = req.body;

    if (!title) {
        throw new ApiError(400, "title is required");
    }

    const newPlaylist = await Playlist.create({
        title,
        description,
        owner: req.user._id,
        videos: []
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                newPlaylist,
                "new playlist created sucessfully"
            )
        )
})

//get all playlist of a user

const getUserPlaylists = asynchandler(async (req, res) => {

    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "Enter userId");

    }

    const getAllPlaylists = await Playlist.aggregate([
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
                        $project: {
                            username: 1,
                            fullname: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $first: "$owner"
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            duration: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                title: 1,
                description: 1,
                owner: 1,
                videos: 1
            }
        }
    ])

    if (getAllPlaylists.length === 0) {
        throw new ApiError(404, "No playlists found for this user");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                getAllPlaylists,
                "all playlist fetched sucessfully"
            )
        )
})

//getPlaylistById

const getPlaylistById = asynchandler(async (req, res) => {

    const { playlistId } = req.params

    if (!playlistId) {
        throw new ApiError(400, "No PlaylistId given");
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
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
                            fullname: 1,
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
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            duration: 1
                        },
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
                                        fullname: 1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ])

    if (playlist.length === 0) {
        throw new ApiError(400, "no playlist exist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist[0],
                "playlist fetched sucessfully"
            )
        )
})

//delete or remove playlist

const deletePlaylist = asynchandler(async (req , res) => {
    const {playlistId} = req.params;

    if(!playlistId){
        throw new ApiError(400 , "give playlistId");
    }

    const deletePly = await Playlist.findByIdAndDelete(playlistId);

    if(!deletePly){
        throw new ApiError(400 , "No such playlist exists"); 
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deletePly,
            "Playlist deleted sucessfully"
        )
    )
})

//update playlist(title/description)

const updatePlaylist = asynchandler(async(req , res) =>{
    const {playlistId} = req.params
    const {title , description} = req.body

    if(!(title || description)){
        throw new ApiError(400 , "Enter title or description");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                title,
                description: description
            }
        },
        {
            new: true
        }
    )

    if(!updatedPlaylist){
        throw new ApiError(400 , "Playlist not exist with such id");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "playlist updated sucessfully"
        )
    )

})

//add video to playlist

const addVideoToPlaylist = asynchandler(async(req , res) =>{

    const {videoId , playlistId} = req.params;

    if(!(videoId && playlistId)){
        throw new ApiError(400 , "videoId or PlaylistsId is not given");  
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(400 , "No playlist exists with such id");
    }

    if(playlist.videos.includes(videoId)){
        throw new Error(400 ,"video with this id already exists in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "video added to playlist"
        )
    )
})

//remove video from playlist

const removeVideoFromPlaylist = asynchandler(async(req , res) =>{

    const {playlistId , videoId} = req.params;

    if(!(playlistId && videoId)){
        throw new ApiError(400 , "give both playlistId and videoId");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new Error(400 , "playlist doesnt exist");  
    }

    if(!(playlist.videos.includes(videoId))){
        throw new ApiError(400 ,"video doesnt exist in playlist");
    }

    playlist.videos.pop(videoId);
    await playlist.save();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "video poped/removed from playlist"
        )
    )
})


export { createPlaylist , getUserPlaylists , getPlaylistById, deletePlaylist , updatePlaylist , addVideoToPlaylist , removeVideoFromPlaylist}