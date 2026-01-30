const express = require('express')
const {
  protectRoute,
  restrictRoute,
} = require('../controllers/authController');
const reviewRouter = express.Router({mergeParams:true}) // mergeParams:true allows us to access params from other routers. in this case tourId from tourRoutes.js
const { protectRoute, restrictRoute }= require("../controllers/authController")
const { createReview, getAllReviews, setTourUserIds, getReview, updateReview, deleteReview } = require("../controllers/reviewControllers");


// POST /tour/:tourId/reviews
// GET /tour/:tourId/reviews
// GET /tour/:tourId/reviews/:reviewId
reviewRouter.use(protectRoute)  
reviewRouter.route("/")
    .get( getAllReviews)
    .post(restrictRoute('user'), setTourUserIds, createReview)
reviewRouter.route("/:reviewId")
    .get( getReview)
    .patch(restrictRoute('user', 'admin'), updateReview)
    .delete(restrictRoute('user', 'admin'), deleteReview)