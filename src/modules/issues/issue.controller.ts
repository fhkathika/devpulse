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
    const {sort,type,status}=req.query
try{
    const result =await issueService.getAllIssueFromDB(
        {sort:sort as string ,
          type:  type as string,
          status:sttaus as string
        }
    )
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
const getSingleIssue=async(req:Request,res:Response)=>{
const {id}=req.params;
try{
const result=await issueService.getSingleIssueFromDB(id as string)
if(result.length===0){
     sendResponse(res,{
    statusCode:404,
        success:false,
       message:"Issues not found",
        data:{},
    })
}
 sendResponse(res,{
    statusCode:200,
        success:true,
       message:"Issue retrived successfully",
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

const updateIssue=async(req:Request,res:Response)=>{
const {id}=req.params;
try{
const result=await issueService.updateIssueFromDB(req.body,id as string)
if(result.rows.length===0){
    sendResponse(res,{
    statusCode:404,
        success:false,
       message:"Issue not found",
       
    })
}

    sendResponse(res,{
    statusCode:200,
        success:true,
       message:"Issue updated successfully",
        data:result.rows[0]
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
const deleteIssue=async(req:Request,res:Response)=>{
const {id}=req.params;
try{
const result=await issueService.deleteIssueFromDB(id as string)
if(result.rowCount===0){
    sendResponse(res,{
    statusCode:404,
        success:false,
       message:"Issue not found",
       
    })
}

    sendResponse(res,{
    statusCode:200,
        success:true,
       message:"Issue deleted successfully",
        data:{}
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
    createIssue,
    getAllIssue,
    getSingleIssue,
    updateIssue,
    deleteIssue
}