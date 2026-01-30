const express = require('express');
const morgan = require("morgan") // returns request values
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userROutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require("./controllers/errorController") 
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require("xss-clean");
const helmet = require('helmet');
const hpp = require('hpp');
const app = express();

const hppOptions = {
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAvg',
    'maxGroupSize',
    'difficulty',
    'price',
  ] // these are the parameters that are allowed to appear multiple times in the query string,
};

//  START MIDDLEWARE...
app.use( morgan('dev'))

// HTTP HEADERS SECURITY MIDDLEWARE
app.use(helmet());

const limiter = rateLimit({
    max:50, // max number of requests from same IP
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many requests from this IP, please try again in an hour!"
})
app.use('/api', limiter) // only apply to routes that start with /api



// BODY PARSER MIDDLEWARE
app.use(express.json({
    limit:"10kb"
})) // this middleware helps to parse incoming json from our requests to javascript objects!.because express does not do this by default
// therefore if we do not parse the JSON object, we would not be able to access the request body.

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// parameter pollution prevention
app.use(hpp(hppOptions))

app.use(express.static(`${__dirname}/public`)) // serving static files like images, css files and js files.

app.use( cookieParser()) // to parse cookies from incoming requests

app.use((request,response,next)=>{
    request.time = new Date().toLocaleString()
    // console.log(request.headers)
    next()
})
// END MIDDLEWARE

// MOUNTING OUR ROUTERS ; middle-ware for handling our requests.
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter)
app.use("/api/v1/reviews", reviewRouter)

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




