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
// console.log("Id:",id)
// console.log({name,password,age,is_active})
try{
const result=await issueService.updateIssueFromDB(req.body,id as string)
if(result.rows.length===0){
    res.status(404).json({
        success:false,
        message:"Issue not found"
    })
}
 res.status(200).json({
        success:true,
        message:"User,updated successfully",
        data:result.rows[0]
    })
}
catch(err:any){
 res.status(500).json({
        success:false,
        message:err.message,
        error:err
    })
}

}
export const issueController={
    createIssue,
    getAllIssue,
    getSingleIssue,
    updateIssue
}