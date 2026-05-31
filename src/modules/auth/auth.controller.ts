import type { Request, Response } from "express"
import { authService } from "./auth.service"
import sendResponse from "../../utility/serverResponse"

const loginUser=async(req:Request,res:Response)=>{
try{
const result=await authService.loginIntoDB(req.body)

 sendResponse(res,{
    statusCode:200,
        success:true,
       message:"Login successful",
        data:result,
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
export const authContributor={
    loginUser
}