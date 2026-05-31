import type { Request, Response } from "express"
import sendResponse from "../../utility/serverResponse"
import { issueService } from "./issue.service"

const createIssue=async(req:Request,res:Response)=>{
  try{
    if(!req.user){
        throw new Error("Unauthorized!")
    }
    const reporterId=req.user.id
    const result=await issueService.createIssueIntoDB(req.body,reporterId)
    sendResponse(res,{
    statusCode:201,
        success:true,
       message:"Issue created successfully",
        data:result.rows[0],
    })

  } 
  catch(error:unknown){
   if(error instanceof Error){

sendResponse(res,{
    statusCode:500,
        success:false,
       message:error.message,
        error:error
    })
    }
    else{

sendResponse(res,{
    statusCode:500,
        success:false,
       message:"Unknown error",
        error:error
    })
    }
  } 
}
export const issueController={
    createIssue
}