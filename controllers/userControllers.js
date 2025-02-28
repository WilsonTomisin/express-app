exports.getAllUsers =(request, response)=>{
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