const express = require('express');
const morgan = require("morgan") // returns request values
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userROutes')

const app = express();



//  START MIDDLEWARE...
app.use( morgan('dev'))

app.use(express.json()) // this middleware helps to parse incoming json from our requests to javascript objects! . because express does not do this by default
// therefore if we do not parse the JSON object, we would not be able to access the request body.

app.use((request,response , next)=>{
    console.log('hello from the middleware.')
    next(); // this is very important as it ensures we proceed in the req-res cycle after a request has been made and the middeleware called
})


app.use((request,response,next)=>{
    request.time = new Date().toLocaleString()
    next()
})
// END MIDDLEWARE

// MOUNTING OUR ROUTERS ; middle-ware for handling our requests.
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users",userRouter)

// END ROUTE DEFINITIONS

module.exports = app




