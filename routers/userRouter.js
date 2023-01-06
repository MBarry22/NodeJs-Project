const express = require("express");
const userRouter = express.Router();

const UserController = require("../controllers/UserController");

userRouter.get("/register", UserController.Register);
userRouter.post("/register", UserController.RegisterUser);

userRouter.get("/login", UserController.Login);
userRouter.post("/login", UserController.LoginUser);

userRouter.get("/logout", UserController.Logout);

userRouter.get("/settings", UserController.Settings);
userRouter.post("/settings", UserController.SettingsUsers)


userRouter.get("/profile", UserController.Profile);
userRouter.get("/profile/:username", UserController.Detail);

userRouter.get("/profiles", UserController.Profiles);

userRouter.post("/profile/comment", UserController.AddComment);

userRouter.get("/manager-area", UserController.ManagerArea);
userRouter.get("/edit/:username", UserController.ManagerEdit);
userRouter.post("/edit", UserController.ManagerEditUser);

userRouter.get("/manager-roles", UserController.ManagerRoles);
userRouter.get("/roles/:username", UserController.Roles);
userRouter.post("/roles", UserController.EditRoles);

userRouter.get("/admin-area", UserController.AdminArea);
userRouter.post("/profile/delete", UserController.DeleteProfile);



module.exports = userRouter;
