const fs = require('fs')
const Tour = require("../models/tourModel")
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require('../utils/appError');


// defining a middleware for our post request on /api/v1/tours
exports.validateTourMiddleware = (request,response,next)=>{
    const { name ,price } = request.body;
    if ( !name || !price) {
        return response.status(400).send({
            status:' fail',
            message:"No name or No Price provided"
        })   
    }
    next();
}
exports.aliasTopCheapestFive = (request,response,next)=>{
    request.query.fields = 'name,price,difficulty,ratingAvg',
    request.query.sort = 'price,-ratingAvg'
    request.query.limit = '5'
    next()
}
// END






exports.getAllTours = catchAsync(async (request,response)=>{
    // we are using the jsend json formatting standard which helps to provide an simple ans consistent way of 
    // defining our return data.
    // its structure --> { status :"success || error|| fail", data:{ ourDataHere}}
    const features = new APIFeatures(Tour.find(),request.query).filter().sort().fieldLimit().pagination()
        const allTours = await features.query // only when have performed all of our methods can we await it's execution.


        response.status(200).json({
            status: 'success',
            data:{
                tourCount: allTours.length,
                page: features.queryString.page * 1 || 1,
                allTours
            }
        })
})

exports.getTourStats = catchAsync(async(request,response)=>{
        const tourStats = await Tour.aggregate([
            {$match :{ ratingAvg:{$lte:4.5}}},
            {
                $group:{
                    _id:"$difficulty", // null if we do not want a unique filter property
                    // _id:null,
                    numberOfTours:{$sum: 1},
                    numberOfRatings:{$sum:"$ratingQuantity"},
                    averageRating:{$avg:"$ratingAvg"},
                    averagePrice:{$avg:"$price"},
                    minimumPrice: {$min:"$price"},
                    maximumPrice:{$max:"$price"}
                }
            },
            {
                $sort:{minimumPrice: 1}
            }
        ])
        response.status(200).json({
            status:"success",
            data:{
                tourStats
            }
        })
        
})

exports.getMonthlyStats = catchAsync(async(request,response)=>{
    const { year } = request.params;

    const monthlyStats = await Tour.aggregate([
        {
            $unwind:"$startDates" // unwind creates individual object using the array values
        },
        {
            $match:{
                startDates:{
                    $gte:new Date(`${year}-01-01`),
                    $lte:new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group:{
                _id:{$month:"$startDates"},
                numberOfTours:{$sum:1},
                listOfTours:{ $push:"$name"} // creates an array of tours available for that month using thier names.
            }
        },
        {
            $addFields:{ month:"$_id"}
        },
        {
            $project:{_id:0}
        },
        {
            $sort:{numberOfTours:-1} // sorts results in descending order from the month with the most amount of tours to the one with the least.
        }  

    ])
    response.status(200).json({
        status:"success",
        data:{
            monthlyStats
        }
    })

   

})

exports.getTour = catchAsync(async(request,response,next)=>{
    const { id } = request.params
    const myTour = await Tour.findById(id)
    if (!myTour) {
        return next(new AppError("Tour was not found", 404))
    }
        response.status(200).json({
            status:"success",
            data:{
                myTour
            }
        })
    
})
exports.createTour = catchAsync(async(request, response)=>{
    const newTour = await Tour.create(request.body)

    await newTour.save()
    response.status(201).send({
        status: 'success',
        data:{
            newTour    
        }
    })

})
exports.updateTour = catchAsync(async(request, response)=>{
    const {id}= request.params
    const updatedTour = await Tour.findByIdAndUpdate(id,request.body,{
        runValidators: true, // this ensures that model validators are used to check data bieng updated,
        new: true
    }) 
    response.status(200).send({
        status:"Success",
        data:"<Tour updated...>"
    })
  
})

exports.deleteTour = catchAsync(async(request,response)=>{
    const { id } = request.params;
    const tour =await Tour.findByIdAndDelete(id).exec()

    if (!tour) {
        return next(new AppError("Tour was not found", 404))
    }
    response.status(200).send({
        status:"success",
        message:`Tour ${id} successfully deleted.`
    })
})