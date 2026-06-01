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

const getAllIssue=async(req:Request,res:Response)=>{
try{
    const result =await issueService.getAllIssueFromDB()
 sendResponse(res,{
    statusCode:200,
        success:true,
       message:"Issues retrived successfully",
        data:result,
    })
}
catch(err:unknown){
if(err instanceof Error){

sendResponse(res,{
    statusCode:500,
        success:false,
       message:err.message,
        error:err
    })
    }
    else{

sendResponse(res,{
    statusCode:500,
        success:false,
       message:"Unknown error",
        error:err
    })
    }
}
}
export const issueController={
    createIssue,
    getAllIssue
}