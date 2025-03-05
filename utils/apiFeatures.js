class APIFeatures{
    constructor(query, queryString){
        this.query = query
        this.queryString = queryString
    }

    filter(){
         //Filter params
        const queryObj = { ...this.queryString} // make a shallow copy to modify.
        const excParams = ['page', 'sort', 'limit','fields'] // params we do not want included in the request query.
        excParams.forEach(el => delete queryObj[el])
        
         // Advanced filtering
        let queryString = JSON.stringify(queryObj) // we convert to a string to modify the obj
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`) // this add a dollar sign infront of lt|lte|gt|gte
        
     

        this.query = this.query.find(JSON.parse(queryString));
        // console.log('Final Filters:', JSON.parse(queryString)); // Debugging

        // If no filters are provided, find all documents
        // if (Object.keys(JSON.parse(queryString)).length === 0) {
        //     // console.log("this block activated!")
        //     this.query = this.query.find();
            
        // } else {
        //     this.query = this.query.find(JSON.parse(queryString));
        // }

        return this ;
    }

    sort(){
        if (this.queryString.sort) {
            let sortBy = this.queryString.sort.split(',').join(' ')
            this.query =  this.query.sort(sortBy)
        } 
        // else{
        //     this.query =  this.query.sort("-createdAt name") // minus at the start of the string sorts the query from the newest to the oldest.
        //     // sort query by default sorts from newest to oldest tours
        // }
        // NB: Pagination method was dependent on the outcome of the sort method which defaults to sorting the results from newest to oldest tours ( -createdAt), hence why
        // the pagination method was not skipping as expected. adding (name) to the sort query.Helps arrange in proper order
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
    pagination() {
        const page =  parseInt(this.queryString.page) || 1; // Default to page 1 if not specified
        const limit = parseInt(this.queryString.limit) || 3; // Use the limit from query or default to 3
        const skipValue = (page - 1) * limit;
        
        this.query = this.query.skip(skipValue).limit(limit);
        
        return this; 
    }


}

module.exports = APIFeatures