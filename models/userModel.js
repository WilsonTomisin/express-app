const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        unique:true,
        required:[true,"please provide a unique email address"],
        lowercase:true,
        validate:{
            validator:function(val) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)
            },
            message:"Provide a valid email address."
        }
    },
    photo:{
        type:String,
    },
    password:{
        type:String,
        required:[true, "Enter your password"],
        minLength:[8, "password be more than 7 characters"],
        select:false
    },
    confirmPassword:{
        type:String,
        required:[true, "Please confirm your password"],
        validate:{
            // only works on .create() or on .save()
            validator: function(val) {
                return val === this.password
            } ,
            message:" '{VALUE}' does not match original password."
        }
    }
})


// MONGOOSE DOCUMENT MIDDLEWARE
userSchema.pre("save",async function(next){
    // run this only when password has been modified.
    if (this.isModified("password")) return next() ;

    // HASH THE PASSWORD ASYNCHRONOUSLY WITHOUT BLOCKING THE EVENT LOOP HENCE;"await"
    this.password = await bcrypt.hash( this.password, 12)

    // DO NOT SAVE INT0 OUR DATABASE
    this.confirmPassword = undefined
    next()
})

// In mogoose we can define methods on our SCHEMA (userSchema in this case) class
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
}


const User =  mongoose.model("User", userSchema);

module.exports = User