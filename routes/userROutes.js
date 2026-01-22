const express = require('express');
const {getAllUsers,getUser,updateUser,createUser,deleteUser, updateMe, deleteMe} = require("../controllers/userControllers")
const { signUp ,login, forgotPassword,resetPassword, protectRoute, updatePassword } = require("../controllers/authController")

const userRouter = express.Router();

userRouter.post("/signup", signUp)
userRouter.post("/login", login )
userRouter.post("/forgotPassword", forgotPassword)
userRouter.patch("/resetPassword/:token", resetPassword);
userRouter.patch("/updatePassword",protectRoute, updatePassword)
userRouter.delete("/deleteMe", protectRoute, deleteMe)


userRouter.patch("/updateMe", protectRoute, updateMe)
userRouter.route('/').get(getAllUsers).post(createUser)
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

module.exports = userRouter