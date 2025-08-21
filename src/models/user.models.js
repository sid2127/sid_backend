import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        lowerCase: true,
        trim: true,
        index: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowerCase: true,
        trim: true
    },

    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    avatar: {
        type: String,    //cloudinary url (just like aws which stores images and vedios and provides url in string form)
        required: true
    },

    coverImage: {
        type: String
    },

    watchHistory:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "video"
        }
    ],

    password: {
        type: String,
        required: [true , 'Password is required']
    },

    refreshToken: {
        type: String,
        
    }
    
} ,{timestamp : true})


userSchema.pre("save" , async function(next){            //pre is the middleware method that helps to do work before exporting the db. sava is the middleware that helps whenever we are saving data we have to do this function.
    if(this.isModified("password")){ 
        this.password = await bcrypt.hash(this.password , 10);     //hashes the password by 10 rounds
        next();
    }
})

userSchema.methods.isPasswordCorrect = async function(password){           //we can create our own methods using methods.method name , to do any work.
    return await bcrypt.compare(password , this.password);         //returns true or false , wheather user enters correct password or not. 
}

userSchema.methods.generateAccessToken = function(){
    jsonwebtoken.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },

    process.env.ACCESS_TOKEN_SECRET,

    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}


userSchema.methods.generateRefreshToken = function(){
    jsonwebtoken.sign({
        _id: this._id,
    },

    process.env.REFRESH_TOKEN_SECRET,

    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

export const User = mongoose.model("User", userSchema)