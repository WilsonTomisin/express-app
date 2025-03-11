module.exports = asyncFn =>{
    return(request,response, next)=>{
        asyncFn(request,response,next).catch(next)
    }
}