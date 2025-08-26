import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";


const generate_Access_And_RefreshToken = async (userId) =>{

    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave : false })

        return {accessToken , refreshToken}
        

    } catch (error) {
        
        throw new ApiError(500 , "Something went wrong while generating tokens");        
    }
}


const registerUser = asynchandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // console.log("Incoming body:", req.body);


    const {fullname, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }


    //user.findOne({email})    //this is to check single term

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    

    // if (!avatarLocalPath) {
    //     throw new ApiError(400, "Avatar file is required")
    // }

    const avatar = await UploadOnCloudinary(avatarLocalPath)
    const coverImage = await UploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }


    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )


//User logIn

const loginUser = asynchandler(async (req, res) =>{

    //req body -> data
    //username or email 
    //check the user
    //check password
    //access token and refresh token (generate and send to user (store refresh token in db))
    //send cookies (genrally use to send tokens using cookies only (secure cookies))


    const {username , email , password} = req.body

    if(!(username || email)){
        throw new ApiError(400 , "Username or email doesnt exist");
    }

    const user = await User.findOne({
        $or: [{username} , {email}]
    })

    if(!user){
        throw new ApiError(404 , "User not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(404 , "Invalid Password");
    }


    const {accessToken , refreshToken} = await generate_Access_And_RefreshToken(user._id);

    const logInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    console.log({user: logInUser , accessToken , refreshToken});


    const option = {
        httpOnly: true,
        secure: true
    }


    return res.status(200)
    .cookie("accessToken" , accessToken , option)
    .cookie("refreshToken" , refreshToken , option)
    .json(
        new ApiResponse(
            200,
            {
                user : logInUser , accessToken , refreshToken
            },
            "User login Successfully"
        )
    )

})


//User logout

const logoutUser = asynchandler(async (req , res) =>{

    //for logout we have to add middleware at the path of /logout , which usally get the accesstoken from user using  .
    //once we get 

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(201)
    .clearCookie("accessToken" , option)
    .clearCookie("refreshToken" , option)
    .json(
        new ApiResponse(201 , {} , "User logout sucessfully")
    )
})

//generate new accessToken and refreshToken

const generateTokens = asynchandler( async (req , res) => {
    
    const getToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!getToken){
        throw new ApiError(401 , "Invalid token request");
    }


    try {
        const decodedToken = jwt.verify(getToken , process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id);

        if(!user){
            throw new ApiError(400 , "User not found with such token");
        }

        const {accessToken , refreshToken} = await generate_Access_And_RefreshToken(user._id)

        const option = {
            httpOnly : true,
            secure: true
        }

        return res.status(200)
        .cookie("accessToken" , accessToken , option)
        .cookie("refreshToken" , refreshToken , option)
        .json(
            new ApiResponse(
                200,
                {accessToken , refreshToken},
                "Access token refreshed"
            )
        )

    } catch (error) {
        throw new ApiError(404 , "Tokens invalid or expired");
        
    }
})


//user want to change password

const ChangePassword = asynchandler(async (req , res) =>{

    const {oldPassword , NewPassword} = req.body;

    const user = await User.findById(req.user);
    const checkPassword = await isPasswordCorrect(oldPassword);

    if(!checkPassword){
        throw new ApiError(401 , "wrong password entered");
    }

    user.password = NewPassword;
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password changed Sucessfully"
        )
    )
})


//to get current user

const getCurrentUser = asynchandler( async (req , res) =>{

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "current user fetched successfully"
        )
    )
})


//change field like fullname , email

const updateAccountDetail = asynchandler( async (req , res) =>{

    const [Fullname , Email] = req.body;

    if(!(Fullname || Email)){     //we want to update both let suppose , if any one , we can take && operator
        throw new ApiError(401 , "fullname or email not entered"); 
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname: Fullname,
                email : Email
            }
        },
        {
            new: true
        }

    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Account detail updated sucessfully"
        )
    )
})


//user want to update avatar

const updateAvatar = asynchandler( async (req , res) =>{

    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(401 , "Avatar file not found");
    }

    const avatar_upload = await UploadOnCloudinary(avatarLocalPath);

    if(!avatar_upload){
        throw new ApiError(401 , "Not able to upload on cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar_upload.url
            }
        },
        {
            new: true
        }
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Avatar image updated"
        )
    )
})


//update coverImage

const updateCoverImage = asynchandler( async (req , res) =>{

    const CoverImageLocalPath = req.file?.path;

    if(!CoverImageLocalPath){
        throw new ApiError(401 , "CoverImage file not found");
    }

    const CoverImageUpload = await UploadOnCloudinary(CoverImageLocalPath);

    if(!CoverImageUpload){
        throw new ApiError(401 , "Not able to upload on cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: CoverImageUpload.url
            }
        },
        {
            new: true
        }
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Avatar image updated"
        )
    )
})

export {registerUser , loginUser , logoutUser , generateTokens , ChangePassword , getCurrentUser , updateAccountDetail , updateAvatar , updateCoverImage};