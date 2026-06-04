import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermission";
import { checkDeletePermission } from "../../middlewares/checkDeletePermission";

const router=Router();
// create issue 
router.post('/',auth("contributor","maintainer"),issueController.createIssue)
// get all issue 
router.get('?sort=newest',issueController.getAllIssue)
// get single issue
router.get('/:id',issueController.getSingleIssue)
// update issue 
router.patch('/:id',auth("contributor","maintainer"),checkPermission,issueController.updateIssue)
//delete issue
router.delete('/:id',auth("contributor","maintainer"),checkDeletePermission,issueController.deleteIssue)
export const issueRoute=router