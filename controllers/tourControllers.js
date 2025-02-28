const fs = require('fs')
const Tour = require("../models/tourModel")

// const fileData = fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8') // returns json
// const tours = JSON.parse(fileData)


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

// exports.checkId = (request,response,next, val)=>{
//     console.log('we are here baby!!!!')
//     if ( val > tours.length) {
//         return response.status(404).send({
//             status:"fail",
//             message:"tour not found"
//         })
//     }
//     next();

// }

class APIFeatures{
    constructor(query, queryString){
        this.query = query
        this.queryString = queryString

        this.queryString.page = this.queryString.page ? this.queryString.page * 1 : 1 // NB:Multiplying the query string with one converts the string to a number!
        this.queryString.limit = this.queryString.limit ? this.queryString.limit * 1 : 3
    }

    filter(){
         //Filter params
        const queryObj = { ...this.queryString} // make a shallow copy to modify.
        const excParams = ['page', 'sort', 'limit','fields'] // params we do not want included in the request query.
        excParams.forEach(el => delete queryObj[el])
         
         // Advanced filtering
        let queryString = JSON.stringify(queryObj) // we convert to a string to modify the obj
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`) // this add a dollar sign infront of lt|lte|gt|gte
        
        console.log('Query String:', this.queryString); // Debugging
        console.log('Filtered Query Object:', queryObj); 

        // this.query = this.query.find(JSON.parse(queryString));
        console.log('Final Filters:', JSON.parse(queryString)); // Debugging

        // If no filters are provided, find all documents
        if (this.queryString.page) {
            console.log("this block activated!")
            this.query = this.query.find();
            console.log(this.query);
            
        } else {
            this.query = this.query.find(JSON.parse(queryString));
        }

        return this ;
    }

    sort(){
        if (this.queryString.sort) {
            let sortBy = this.queryString.sort.split(',').join(' ')
            this.query =  this.query.sort(sortBy)
        } 
        else{
            this.query =  this.query.sort("-createdAt") // minus at the start of the string sorts the query from the newest to the oldest.
            // sort query by default sorts from newest to oldest tours
        }
        return this;

    }
    fieldLimit(){
        if(this.queryString.fields){
            let selectedFields = this.queryString.fields.split(",").join(" ")
            this.query = this.query.select(selectedFields)

        }else{
            this.query = this.query.select("-__v") // minus here signals exclusion i.e;we are excluding the parameter provided by default
        }
        return this;
    }

    pagination(){
        if(this.queryString.page){
            const page = this.queryString.page   // NB:Multiplying the query string with one converts the string to a number!
            const limit = this.queryString.limit 
            const skipValue = (page - 1 ) * limit // page 1 skips zero results, page 2 skips the number specified in the limit or 10 by default and soo on...
            
            console.log(`Page: ${page}, Limit: ${limit}, Skip: ${skipValue}`); // Debugging

            this.query = this.query.skip(skipValue).limit(limit) 
        }else{
            this.query = this.query.skip(0).limit(3) 

        }
        //skip method recieves a number of results to ignore and limit the number of results to show.
        // if (this.queryString.page) {
        //     const noOfTours = await this.query.countDocuments()
        //     if( skipValue >= noOfTours) throw new error('You have reached the end of the document')
            
        // }
    
        return this
    }

}

exports.getAllTours = async (request,response)=>{
    // we are using the jsend json formatting standard which helps to provide an simple ans consistent way of 
    // defining our return data.
    // its structure --> { status :"success || error|| fail", data:{ ourDataHere}}
    try {
        let features = new APIFeatures(Tour,request.query).filter().sort().fieldLimit().pagination()
        let allTours = await features.query // only when have performed all of our methods can we await it's execution.

        console.log('Final Query:', features.query.getQuery()); // Debugging
        const totalTours = await Tour.countDocuments();
        console.log(`Total Documents: ${totalTours}`); 

        response.status(200).json({
            status: 'success',
            data:{
                tourCount: allTours.length,
                page: features.queryString.page,
                allTours
            }
        })
    } catch (error) {
        console.log(error)
        response.status(400).json({
            status: 'error',
            error:{
                message: "Could not get tours"
            }
        })
    }

}

exports.getTour = async(request,response)=>{
    const { id } = request.params

    try {
        const myTour = await Tour.findById(id)
        response.status(200).json({
            status:"success",
            data:{
                myTour
            }
        })
        
    } catch (error) {
        response.status(404).json({
            status:"error",
            error:error.message
        })
        
    }
    
}
exports.createTour = async(request, response)=>{

    try {
        const newTour = await Tour.create(request.body)

        await newTour.save()
        response.status(201).send({
            status: 'success',
            data:{
                newTour    
            }
        })

    } catch (error) {
        if (error.code === 11000) {
            response.status(400).send({
                status: 'error',
                error: error.errorResponse
           })    
        }
        response.status(400).send({
            status: 'error',
            error: error.message
       })   
    }
}
exports.updateTour = (request, response)=>{
    try {
        response.status(200).send({
            status:"Success",
            data:"<Tour updated...>"
        })
        
    } catch (error) {
        response.status(200).send({
            status:"error",
            error:{
                message:error.message
            }    
        })
    }
  
}

exports.deleteTour = async(request,response)=>{
    const { id } = request.params;
    try {
        await Tour.findByIdAndDelete(id).exec()
        response.status(200).send({
            status:"success",
            message:`Tour ${id} successfully deleted.`
        })
    } catch (error) {
        response.status(400).send({
            status:'error',
            message: error
        })
        
    }
 

}