const express = require('express');
const {getAllUsers,getUser,updateUser,createUser,deleteUser} = require("../controllers/userControllers")
const { signUp ,login, forgotPassword,resetPassword } = require("../controllers/authController")

const userRouter = express.Router();

userRouter.post("/signup", signUp)
userRouter.post("/login", login )
userRouter.post("/forgotPassword", forgotPassword)
userRouter.post("/resetPassword", resetPassword)


userRouter.route('/').get(getAllUsers).post(createUser)
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

module.exports = userRouter