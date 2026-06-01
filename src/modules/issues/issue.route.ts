import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middlewares/auth";

const router=Router();
// create issue 
router.post('/',auth("contributor","maintainer"),issueController.createIssue)
// get all issue 
router.get('/',issueController.getAllIssue)

export const issueRoute=router