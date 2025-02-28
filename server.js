const dotenv = require("dotenv")
dotenv.config({path:"./.env.local"}) // read env file before our app is mounted!

const mongoose = require("mongoose")
const app = require("./index")


const DB = process.env.DB_HOST.replace("<db_password>", process.env.DB_PASSWORD); 


mongoose.connect(DB).then( () =>{
    console.log(`Connected to our database`)
}).catch( (err)=>{
    console.log(`An error occured:${err}`)
})

const PORT = 5500 ;
app.listen(PORT,()=>{
    console.log(`listening on http://localhost:${PORT}... `);
})