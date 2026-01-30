const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const crypto = require("crypto")
const {sendMail} = require("../utils/email")


const signToken = (id) =>{
    return jwt.sign( {id}, process.env.JWT_SECRET,{
        expiresIn:process.env.EXPIRES_IN
    })
}

function createToken({ user, statusCode, message, response}) {
    const token = signToken(user._id);
    // .ENV variables are stored as strings convert to number here
    const days = parseInt(process.env.COOKIE_EXPIRES_IN, 10)
    response.cookie('jwt', token, {
      expires: new Date(
        Date.now() +
          days * 24 * 60 * 60 * 1000,
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
    });
    response.status(statusCode).json({
      status: 'success',
      message,
      token,
      data: {
        user,
      },
    });
}
exports.signUp = catchAsync( async(request,response, next)=>{
    const {name, email,password,confirmPassword, passwordChangedAt} = request.body
        const newUser = await User.create({
          name,
          email,
          password,
          confirmPassword,
          passwordChangedAt,
        });
    //.create is a document write method meaning it will bypass the select:false in our schema and return all the information  soo we manually set it to undefined
    newUser.password = undefined;
    newUser.active = undefined;
    // await newUser.save(). we do not need to save again .create() already saves to the DB
    

    createToken({
        response,
        message: 'Account created successfully',
        statusCode: 201,
        user:newUser
        })
})
exports.signUpAdminOrGuide = catchAsync(async (request, response, next) => {
    const { name, email, password, confirmPassword, passwordChangedAt, role } = request.body
        const newUser = await User.create({
          name,
          email,
          password,
          confirmPassword,
            passwordChangedAt,
          role
        });
    //.create is a document write method meaning it will bypass the select:false in our schema and return all the information  soo we manually set it to undefined
    newUser.password = undefined;
    newUser.active = undefined;
    // await newUser.save(). we do not need to save again .create() already saves to the DB
    

    createToken({
        response,
        message: 'Account created successfully',
        statusCode: 201,
        user:newUser
        }) })

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
    foundUser.password = undefined;
    if ( foundUser.active === false) {
        return next(new AppError("This account is no longer active", 401))
    }
    createToken({
        response, 
        statusCode: 200,
        message: "success",
        user: foundUser
    })
})

exports.protectRoute = catchAsync(async(request,response,next)=>{

    let token;
    //For Mobile apps and other API clients( e.g POSTMAN)
    if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
      token = request.headers.authorization.split(" ")[1]
    }

    //  For web applications using cookies
    if ( !token && request.cookies?.jwt) {
        token = request.cookies.jwt
    }
    if (!token) {
        return next(new AppError( "You are not authorized to use this resource.", 401))
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // console.log(decoded)
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

exports.forgotPassword = catchAsync(async (request, response, next) => {
    const {email} =  request.body
    if (!email || email.trim() == '') {
        return next(new AppError("Provide email address", 400))
    }
    // get email from POSTed email address
    const foundUser = await User.findOne({email})

    //check if user exists
    if (!foundUser) {
        return next(new AppError("This user does not exist",404))
    }

    // generate token
    const resetToken = foundUser.createPasswordResetToken()
    
    // IF WE TURN ON MODEL VALIDATION, OUR PASSWORDS AND OTHER PROPERTIES WE SPECIDFIED TO BE REQUIRED WILL HAVE TO BE BE SUPPLIED
    //..AND WE DO NOT NEED THAT HERE JUST THE EMAIL OF OUR USER.
    await foundUser.save({ validateBeforeSave: false  }) // model validation is not neccessary here. we need to save our token into our DB
    const resetURL = `${request.protocol}://${request.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Reset your password by submitting a PATCH request with your new password and confirmd password to this URL: ${resetURL}. Ignore this if not requested.`;
    
    // we use a try/catch block beacuse we want to update the data if sending the mail fails
    try {
        
        await sendMail({
          email: foundUser.email,
          subject: 'Password reset , token expires in 10mins.',
          message,
        });

        return response.status(200).json({
            status: "success",
            message: "Reset token sent."
        })
    } catch (error) {
        console.log('Email error:', error);

        foundUser.passwordResetToken = undefined;
        foundUser.passwordResetExpires = undefined;
        await foundUser.save({ validateBeforeSave: false });

        return next( new AppError("Something went wrong while sending your email. please try again", 500))
    }
    // next()
})
exports.resetPassword = catchAsync(async (request, response, next) => {
    // hash the token from our url param
    const hashedToken = crypto.createHash('sha256').update(request.params.token).digest('hex')

    // query for the user with this token in our db.
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next( new AppError('Invalid/Expired token', 400))
    }
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.password = request.body.password;
    user.confirmPassword = request.body.confirmPassword

    await user.save();
    createToken({
      response,
      statusCode: 201,
      message: 'Password reset successfully.',
      user,
    });
})

exports.updatePassword = catchAsync(async (request, response, next) => {
    const { current_password, password, confirmPassword } = request.body;
    if (!current_password || current_password.trim() === '' || !password || password.trim() === '') {
        return next(new AppError("Provide your current and new password", 400))
    }
    const foundUser = await User.findById(request.user._id).select("+password");
    if (!foundUser) {
      return next(new AppError('User does not exist', 404));
    }
    const isPasswordCorrect = await foundUser.correctPassword(current_password, foundUser.password);
    if (!isPasswordCorrect) {
        return next( new AppError("Current Password is not correct", 401))
    }
    foundUser.password = password;
    foundUser.confirmPassword = confirmPassword;
    await foundUser.save();
   
    createToken({
      response,
      statusCode: 201,
      message: 'Password updated successfully.',
      user:foundUser,
    });

})