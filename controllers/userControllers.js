const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const User = require('../models/userModel');


function filterObj(requestBody, objKeysArray) {
    const filteredObj = {}
    objKeysArray.forEach(element => {
        if (element in requestBody) {
            filteredObj[element]= requestBody[element]
        }
    });
    return filteredObj
}
exports.updateMe = catchAsync(async (request, response, next) => {
  if (request.body.password || request.body.confirmPassword) {
    return next(new AppError('Cannot update password here', 403));
    }
    
    const filteredObj = filterObj(request.body, ['name', 'email'])
    const user = await User.findByIdAndUpdate(request.user._id, filteredObj, {
        new: true,
        runValidators:true
  } )
    response.status(200).send({
        status: "success",
        message: "Data updated",
        data: {
            user
        }
  });
});

exports.deleteMe = catchAsync(async (request, response, next) => {
    await User.findByIdAndUpdate(request.user._id, {active:false})

    response.status(204).send({
        status: "success",
        data: null
    });
});

exports.getAllUsers = (request, response) => {
    response.status(200).send({
        status:"success",
        data:' <getting all users..>'
    })

}
exports.createUser = (request, response)=>{
    response.status(201).send({
        status:"success",
        data: 'user created'
    })

}
exports.getUser = (request,response)=>{
        response.status(200).send({
            status:"success",
            data:{
                user:" john smith"
            }
        })
}
exports.updateUser=(request,response)=>{
        response.status(200).send({
            status:"success",
            message:" <user updated...>"

        })
}
exports.deleteUser =(request,response)=>{
        response.status(204).send({
            status:"success",
            data: null
        })
}