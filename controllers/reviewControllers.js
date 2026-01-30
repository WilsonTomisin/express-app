const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');



const createReview = catchAsync(async (request, response) => {
    const newReview = await Review.create(request.body);
    response.status(201).send({ 
        status: 'success',
        data: {
            review: newReview,
        },
    });
});
const getAllReviews = catchAsync(async (request, response) => {
  const allReviews = await Review.find();
  response.status(201).send({
    status: 'success',
    data: {
      reviews: allReviews,
    },
  });
});
const getReview = catchAsync(async (request, response) => {
    const reviewId = request.params.reviewId;
    const review = await Review.findById(reviewId);
    if (!review) {
        return next(new AppError('No review found with that ID', 404));
    }   
  response.status(201).send({
    status: 'success',
    data: {
      review: review,
    },
  });
});
const updateReview = catchAsync(async (request, response) => {
    const reviewId = request.params.reviewId;
  const updatedReview = await Review.findByIdAndUpdate(reviewId, request.body, {
    new: true,
    runValidators: true,
  });
  response.status(201).send({
    status: 'success',
    data: {
      review: updatedReview,
    },
  });
});
const deleteReview = catchAsync(async (request, response) => {
  const newReview = await Review.findByIdAndDelete(request.params.reviewId);
  response.status(201).send({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.createReview = createReview;
exports.getAllReviews = getAllReviews;
exports.getReview = getReview;
exports.updateReview = updateReview;
exports.deleteReview = deleteReview;