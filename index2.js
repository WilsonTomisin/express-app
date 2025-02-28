const express = require('express');


const app = express();
const PORT = 8000

app.use(express.json()) // this middleware helps to parse incoming json from our requests to javascript objects! . because express does not do this by default
// therefore if we do not parse the JSON object, we would not be able to access the request body. 

app.get('/', (request,response)=>{
    response.status(200).send({message:"hello Tomisin",place:"127.0.0.1"})
    //  response.json({message:"hello Wilson",place:"127.0.0.1"})
    
})

app.post('/tours/:id',(request,response)=>{
    const { id } = request.params ;
     const {name}= request.body ;
    console.log(request.body)
    
     if (!name) {
        response.status(418).send({
            message:"enter your name"
        })
     }
    response.status(200).send({
        message:`message was received ${name} for tour ${id}`
    })
    // console.log(request);
    
})

app.listen(PORT,()=>{
    console.log(` listening on http://127.0.0.1:${PORT}`);

})