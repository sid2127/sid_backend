import { user } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";


const registerUser = asynchandler( async(req , res) => {
    
    //Detail of user from frontend(username , email , password , image , avatar , etc)
    //Validation(not empty or not - the usrname , email  etc)
    //Check user already exits or not: email , username
    //check for images , check for avatar
    //upload them to cloudinary, avatar
    //create user object - create entry in DB
    //remove user password and refresh token field from response(response from DB)
    //check for user creation
    //return res


    const {username , fullname , email , password} = req.body
    console.log("email :" , email);
    // console.log("password :" , password);
    

    // if(fullname === ""){             // we can check for all field one by one by this but there is simpler method also to check all in single check
    //     throw new ApiError(400 , "full name is required" )
        
    // }

    if([username , fullname , email , password].some((field) =>
    field?.trim() === "")){

        throw new ApiError(400 , "field is required")
    }


    //user.findOne({email})    //this is to check single term

    const existedUser = user.findOne({
        $or: [{email} , {username}]
    })

    if(existedUser){
        throw new ApiError(409 , "User with similar email or username already existed");
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.avatar[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file not found");
        
    }

    const avatar = await UploadOnCloudinary(avatarLocalPath)
    const coverImage = await UploadOnCloudinary(coverImageLocalPath)


    if(!avatar){
        throw new Error(400 , "avatar is required");
    }


    const user = await user.create({
        fullname,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        password
    })


    const createdUser = user.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500 , "Something went wrong while registring a user");
        
    }


    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User registered succesfully")
    )
    
    
})


export {registerUser};