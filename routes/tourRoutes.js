const express = require('express')
const {
    getAllTours,
    getTour, 
    updateTour,
    createTour,
    deleteTour,
    checkId, 
    getTourStats,
    getMonthlyStats,
    validateTourMiddleware,
    aliasTopCheapestFive
} = require("../controllers/tourControllers");
const { protectRoute }= require("../controllers/authController")

// console.log(arguments)
const tourRouter = express.Router();

// param middleware...
// tourRouter.param("id", checkId) // checks if id exists and returns an error response if it does not



tourRouter.route("/best-affordable-five").get( aliasTopCheapestFive, getAllTours)
tourRouter.route("/statistics").get(getTourStats)
tourRouter.route("/monthly-statistics/:year").get(getMonthlyStats)



tourRouter.route('/').get( protectRoute, getAllTours).post(
    // validateTourMiddleware,
    createTour )
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)



module.exports = tourRouter ;