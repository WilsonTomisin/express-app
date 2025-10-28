const AppError = require("../utils/appError")

const handleCastError=(err)=>{
    const message = `Invalid${err.path}:${err.value}`
    return new AppError(message, 400)
}
const handleDuplicateError =(err)=>{
    const key = err.errmsg.split('"')[1]
    console.log(key);
    
    const message = `Duplicate field value: ${key}`
    return new AppError( message, 400)
}
const handleValidationError =(err)=>{
    const errArr = Object.values( err.errors)
    let message;

    message = errArr.map(err =>{
        return err.properties.message
    })
    // console.log(errArr);
    
    // return new AppError(err.message,400) we can also use this approach.

    return new AppError(`Invalid data:${message}`,400)
}

const handleJWTError =()=> new AppError("Invalid token. Please login",401)
const handleExpiredToken =()=> new AppError("Token has expired",401)

const sendDevErr = (err,res)=>{
    res.status(err.statusCode).json({
        status: err.status,
        message:err.message,
        error:err,
        stack: err.stack
    })

}
const sendProdErr = (err,res)=>{
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message:err.message
        })
        return
    } 
        console.error(err);
        res.status(500).json({
          status: 'error',
          message: 'something went wrong',
        });
        
    

}

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500
    err.status = err.status || "failed";


    if (process.env.NODE_ENV === 'development') {
        sendDevErr(err, res)    
    }else if (process.env.NODE_ENV === 'production') {
        let copyErr = Object.create(err) // we have to create an object from the error values. We cannot make a shallow copy of it like before because the values have soon been moved in to the obj prototype in mongoose update
        if (copyErr.name === "CastError") copyErr = handleCastError(copyErr)
        if (copyErr.code === 11000) copyErr = handleDuplicateError(copyErr)
        if(copyErr.name === "ValidationError") copyErr = handleValidationError(copyErr)
        if (copyErr.name === "JsonWebTokenError") copyErr = handleJWTError(copyErr)
        if (copyErr.name === "TokenExpiredError") copyErr = handleExpiredToken(copyErr)
        
        sendProdErr(copyErr,res)
    }
    // next()

}