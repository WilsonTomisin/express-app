const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require('validator')

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
            validator: validator.isEmail,
            // function(val) {
            //     return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)
            // }
            message:"Provide a valid email address."
        }
    },
    role:{
        type:String,
        enum:["admin", "user","guide","lead-guide"],
        default:"user"
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
    },
    passwordChangedAt: Date,

    passwordResetToken:String,
    passwordResetExpires:Date
})


// MONGOOSE DOCUMENT MIDDLEWARE
userSchema.pre("save",async function(next){
    // run this only when password has been modified.
    if (!this.isModified("password")) return next() ;

    // HASH THE PASSWORD ASYNCHRONOUSLY WITHOUT BLOCKING THE EVENT LOOP HENCE;"await"
    this.password = await bcrypt.hash( this.password, 12)

    // DO NOT SAVE INT0 OUR DATABASE
    this.confirmPassword = undefined
    next()
})
userSchema.pre("save", function(next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now() -1000 // token might have been issued before this document is saved soo to be safe we take away a second from when the document is saved.
    next()
})

// In mongoose we can define methods on our SCHEMA (userSchema in this case) class
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
}

userSchema.methods.changedPasswordAt = function(JWTtimestamp){
    // this entire block functions to check if JWTtimeStamp is older than the 
    // password changed at property
    if (this.passwordChangedAt) {
        // mongoose stores dates as strings .this varaible converts
        //the string to a number using parseInt(), getTime() converts the date which defaults to milliseconds
        //we then convert to seconds by dividing by 1000 and we convert to base 10 as the second arg in the 
        // parseInt function.
        const timeStamp = parseInt( this.passwordChangedAt.getTime() / 1000 , 10)
        console.log("Passwordchangedat: "+timeStamp ,"JWT: "+JWTtimestamp)
        return JWTtimestamp < timeStamp
    }

    return false
}

userSchema.methods.createPasswordResetToken = function() {
    // GENERATE THE RANDOM TOKEN 
    const resetToken = crypto.randomBytes(32).toString("hex")

    // WE SAVE A HASHED VERSION OF OUR TOKEN INTO OUR DB AND WE COMPARE THE HASHED VERSION TO THE PROVIDED  ONE.
    //FOR SECURITY ISSUES
    this.passwordResetToken =  crypto.createHash("sha256").update(resetToken).digest("hex")  ;
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // token expires in 10mins in milliseconds
    
    //SEND OUR TOKEN.
    return resetToken
}

const User =  mongoose.model("User", userSchema);

module.exports = User