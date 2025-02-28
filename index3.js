const express = require('express');
const morgan = require("morgan") // returns request values
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userROutes')

const app = express();
const PORT = 5500 ;

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

// const fileData = fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8') // returns json
// const tours = JSON.parse(fileData); // returns JS object
// console.log(tours)

// START ROUTE HANDLERS



// END ROUTE HANDLERS...



// START ROUTE DEFINITIONS

// a method of defining routes and handlers

// app.get('/api/v1/tours', getAllTours)
// app.get('/api/v1/tours/:id', getTour)
// app.post("/api/v1/tours", createTour)
// app.patch("/api/v1/tours/:id", updateTour)
// app.delete("/api/v1/tours/:id", deleteTour)




// this method explicitly defines HTTP methods for specific routes without having to define it multiple times like we did above.
// by chaining the methods to the routes

// const tourRouter = express.Router();
// const userRouter = express.Router();

// tourRouter.route('/').get(getAllTours).post(createTour);
// tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

// userRouter.route('/').get(getAllUsers).post(createUser)
// userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

// MOUNTING OUR ROUTERS ; middle-ware for handling our requests.
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users",userRouter)

// END ROUTE DEFINITIONS

module.exports = app
// SERVER
app.listen(PORT,()=>{
    console.log(`listening on http://127.0.0.1:${PORT} \nor on http://localhost:${PORT}... `);  
})


