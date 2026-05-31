import { Router } from "express";
import { userController } from "./users.controller";

const router=Router();
//create user
router.post('/',userController.createUser)
export const  userRoute=router