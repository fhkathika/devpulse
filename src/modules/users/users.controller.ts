import type { Request, Response } from "express"
import { userService } from "./users.service"
import sendResponse from "../../utility/serverResponse"

const createUser=async(req:Request,res:Response)=>{
try{
const result=await userService.craeteUserIntoDB(req.body)
 sendResponse(res,{
    statusCode:201,
        success:true,
       message:"User registered successfully",
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
export const userController={
    createUser
}