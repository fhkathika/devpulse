import { Router } from "express";
import { authContributor } from "./auth.controller";

const router=Router();
router.post("/login",authContributor.loginUser)
export const authRouter=router