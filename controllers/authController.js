const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const { promisify} = require("util")


const signToken = id =>{
    return jwt.sign( {id}, process.env.JWT_SECRET,{
        expiresIn:process.env.EXPIRES_IN
    })
}
exports.signUp = catchAsync( async(request,response, next)=>{
    const {name, email,password,confirmPassword, passwordChangedAt, role} = request.body
        const newUser = await User.create({name,email,password,confirmPassword,passwordChangedAt,role});
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
    if (!token) {
        return next(new AppError( "You are not authorized to use this resource.", 401))
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    console.log(decoded)
    // check if the user still exists
    const foundUser = await User.findById(decoded.id)
    if (!foundUser) {
        return next(new AppError("User no longer exists", 401))
    }

    // check if user has changed their password after token was issued i.e after they logged in.

    if(foundUser.changedPasswordAt(decoded.iat)){
        return next(new AppError("Password has been changed. Please login again" , 401))
    }

    // grant access to protected route
    request.user = foundUser // logged in user is now accessable in the request user obj for subsequent middlewares e.g "restrictRoute"
    next()
})

exports.restrictRoute =(...roles)=>{

    return catchAsync(async(request,response,next)=>{
        // roles is an array ['admin', 'guide']
        if (roles.includes(request.user.role)) {
            return next()
        }
        return next( new AppError( "You can't perform this action!", 403))
    })
}