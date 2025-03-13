const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");


const signToken = id =>{
    return jwt.sign( {id}, process.env.JWT_SECRET,{
        expiresIn:'5h'
    })
}
exports.signUp = catchAsync( async(request,response, next)=>{
    const {name, email,password,confirmPassword} = request.body
        const newUser = await User.create({name,email,password,confirmPassword});
        await newUser.save()

        const token = signToken(newUser._id)
        response.status(201).json({
            status:"success",
            token,
            data:{
                user:newUser
            }
        })
})

exports.login = catchAsync(async(request,response,next)=>{
    const {email, password} = request.body

    if (!email || !password) {
        return next(new AppError("provide your email and password.",400))
    }

    //find user
    const foundUser = await User.findOne({email}).select("+password") // since password is not returned as we defined in our schema we have to select it

    // check if credentials are valid
    if (!foundUser || ! await foundUser.correctPassword(password, foundUser.password)) {
        return next(new AppError("Invalid credentials", 401))
    }
    const token = signToken(foundUser._id)

    response.status(200).json({
        status:"success",
        token
    })
})

exports.protectRoute = catchAsync(async(request,response,next)=>{

    let token ;
    if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
      token = request.headers.authorization.split(" ")[1]
    }
    console.log(token)
    if (!token) {
        return next(new AppError( "You are not authorized to use this resource.", 401))
    }
    next()
})