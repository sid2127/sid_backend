import mongoose from "mongoose";

const subscriptionShcema = new mongoose.Schema({
    
    subscriber : {             //the one who is subscribing.(subscriber)
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    channel : {
        type: mongoose.Schema.Types.ObjectId,        //the channel to whom subscriber is subscribing
        ref: "User"
    }
},{timestamps: true});

export const Subscription = mongoose.model("Subscription", subscriptionShcema);