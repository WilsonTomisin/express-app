        
        ## MODIFYING REQUESTS !!

        // //Filter params
        // const queryObj = { ...request.query} // make a shallow copy to modify.
        // const excParams = ['page', 'sort', 'limit','fields'] // params we do not want included in the request query.
        // excParams.forEach(el => delete queryObj[el])
        
        // // Advanced filtering
        // let queryString = JSON.stringify(queryObj) // we convert to a string to modify the obj
        // queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`) // this add a dollar sign infront of lt|lte|gt|gte
 
        // Sorting
        // let query =  Tour.find(JSON.parse(queryString)) // convert the string back to a JS object NB: do not await this response
        // because we are chaining multiple methods e.g sort, select e.t.c soo we cannot await the query's execution  
        // if (request.query.sort) {
        //     let sortBy = request.query.sort.split(',').join(' ')
        //     query =  query.sort(sortBy)
        // } 
        // else{
        //     query =  query.sort("-createdAt") // minus at the start of the string sorts the query from the newest to the oldest.
        //     // sort query by default sorts from newest to oldest tours
        // }

        // Field Limiting
        // if(request.query.fields){
        //     let selectedFields = request.query.fields.split(",").join(" ")
        //     query = query.select(selectedFields)

        // }else{
        //     query = query.select("-__v") // minus here signals exclusion i.e;we are excluding the parameter provided by default
        // }

        // Pagination
        // const page = request.query.page * 1 || 1 // NB:Multiplying the query string with one converts the string to a number!
        // const limit = request.query.limit * 1 || 3

        // const skipValue = (page - 1 ) * limit // page 1 skips zero results, page 2 skips the number specified in the limit or 10 by default and soo on...
        // query = query.skip(skipValue).limit(limit)
        // //skip method recieves a number of results to ignore and limit the number of results to show.
        // if (request.query.page) {
        //     const noOfTours = await Tour.countDocuments()
        //     if( skipValue >= noOfTours) throw new error('You have reached the end of the document')
            
        // }