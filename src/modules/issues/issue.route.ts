import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermission";

const router=Router();
// create issue 
router.post('/',auth("contributor","maintainer"),issueController.createIssue)
// get all issue 
router.get('/',issueController.getAllIssue)
// get single issue
router.get('/:id',issueController.getSingleIssue)
// update issue 
router.patch('/:id',auth("contributor","maintainer"),checkPermission,issueController.updateIssue)
export const issueRoute=router