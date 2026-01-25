const express = require('express');
const morgan = require("morgan") // returns request values
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userROutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require("./controllers/errorController") 
const cookieParser = require('cookie-parser');
const app = express();



//  START MIDDLEWARE...
app.use( morgan('dev'))

app.use(express.json()) // this middleware helps to parse incoming json from our requests to javascript objects! . because express does not do this by default
// therefore if we do not parse the JSON object, we would not be able to access the request body.

// app.use((request,response , next)=>{
//     console.log('hello from the middleware.')
//     next(); // this is very important as it ensures we proceed in the req-res cycle after a request has been made and the middeleware called
// })

app.use( cookieParser() ) // to parse cookies from incoming requests

app.use((request,response,next)=>{
    request.time = new Date().toLocaleString()
    // console.log(request.headers)
    next()
})
// END MIDDLEWARE

// MOUNTING OUR ROUTERS ; middle-ware for handling our requests.
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users",userRouter)

// END ROUTE DEFINITIONS



// HANDLE OTHER ROUTES NOT SPECIFIED
app.all("*",(request,response,next)=>{
    // METHOD 1
    // response.status(404).json({
    //     status:"error",
    //     error:`Could not find ${request.originalUrl} on this server.`
    // })

    // METHOD 2
    // const error = new Error(`Could not find ${request.originalUrl} on this server.`)
    // error.statusCode = 404,
    // error.status = 'error'
    // next(error)

    // METHOD 3
    next(new AppError(`Could not find ${request.originalUrl} on this server.`), 400)
});


// EXPRESS GLOBAL ERROR HANDLER 
app.use(globalErrorHandler)


module.exports = app




