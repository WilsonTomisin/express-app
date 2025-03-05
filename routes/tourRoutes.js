const express = require('express')
const {
    getAllTours,
    getTour, 
    updateTour,
    createTour,
    deleteTour,
    checkId, 
    getTourStats,
    validateTourMiddleware,
    aliasTopCheapestFive
} = require("../controllers/tourControllers");

// console.log(arguments)
const tourRouter = express.Router();

// param middleware...
// tourRouter.param("id", checkId) // checks if id exists and returns an error response if it does not



tourRouter.route("/best-affordable-five").get( aliasTopCheapestFive, getAllTours)
tourRouter.route("/statistics").get(getTourStats)
tourRouter.route('/').get(getAllTours).post(
    // validateTourMiddleware,
    createTour )
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)



module.exports = tourRouter ;