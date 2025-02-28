const mongoose = require("mongoose")

const tourSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "please provide a name for your tour"],
        unique: true //NB: you cannot provide a unique message like in "required" above instead you can listen for the error code "11000" which mongoose throws if this porperty is violated.
    },
    duration:{
        type:Number,
        required:[true, "A tour must have a duration"]
    },
    maxGroupSize:{
        type:Number,
        required:[true,"A tour must have a group size"]
    },
    difficulty:{
        type:String,
        required:[true, "Include the difficulty level"]
    },
    ratingAvg:{
        type:Number,
        default:3.25
    },
    ratingQuantity:{
        type:Number,
        default: 0
    },
    price:{
        type:Number,
        required:[true,"Tour must have a price "]
    },
    discount:{
        type:Number,
        default: 0
    },
    summary:{
        type:String,
        trim: true ,  // this removes white-space
        required:[true, "Included a summary"]
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type: String,
    },
    images: [String],
    createdAt:{
        type:Date,
        default: Date.now(), // monogo automatically parsed it to a readable string
        select:false // does not return this porperty anytime a request is made.
    },
    startDates: [Date]
})

const Tour = mongoose.model("Tour", tourSchema)

module.exports = Tour