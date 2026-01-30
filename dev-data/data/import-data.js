/*
    this program is ran once in our CLI  to import and/or delete
    existing tours.
*/


const fs = require("fs")
const Tour = require("./../../models/tourModel")
const DB = require("./../../server")



// read our file
const tours = JSON.parse( fs.readFileSync( `${__dirname}/tours.json`, "utf8")); // necessary to import data into our database.


const importData = async()=>{
    try {
        await Tour.create(tours) // create method can accept an array of objects also.
        console.log('Data imported successfully')
        // return 
    } catch (error) {
        console.log(error)
        // return error
    }
    process.exit() // stop the program from running once execution is completed NB: THIS IS A FORCED METHOD!

}
const deleteExistingTours = async()=>{
    try {
        await Tour.deleteMany().exec()
        console.log('All Existing tours removed.')
        // return 
    } catch (error) {
        console.log(error)
        // return error
    }
    process.exit()

}


if(process.argv[2] === "--import"){
    importData()
}else if (process.argv[2] === "--delete") {
    deleteExistingTours()
} else{
    return null
}
// console.log(process.argv) // returns an array containing the command line arguments.
