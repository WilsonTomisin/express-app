const mongoose = require("mongoose")

const tourSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "please provide a name for your tour"],
        unique: true, //NB: you cannot provide a unique message like in "required" above instead you can listen for the error code "11000" which mongoose throws if this porperty is violated.
        minLength: [5,"tour must have more than 5 characters"],
        maxLength:[20, "tour cannot have more than 20 characters"]
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
        required:[true, "Include the difficulty level"],
        enum:{
            values:['easy','medium','difficult'],
            message:"Invalid difficulty type"
        }
    },
    ratingAvg:{
        type:Number,
        default:3.25,
        min:[1, "minimum rating is 1"],
        max:[5, "maximum rating is 5"]
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
        default: 0,
        validate:{
            validator:function(value){
                // NB:this only works when creating a new tour not when updating one.
                return value < this.price
            },
            message:"discount '{VALUE}' is more than the price"
        }
    },
    summary:{
        type:String,
        trim: true ,  // this removes white-space
        required:[true, "A tour must include a summary"]
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
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

tourSchema.virtual("durationWeeks").get(function() {
    return this.duration / 7
}) // VIRTUAL PROPERTIES.

const Tour = mongoose.model("Tour", tourSchema)

module.exports = Tour