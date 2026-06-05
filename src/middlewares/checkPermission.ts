import type { NextFunction, Request, Response } from "express";
import { pool } from "../db";
import sendResponse from "../utility/serverResponse";

export const checkPermission=async(req:Request,res:Response,next:NextFunction)=>{
try{
const {id}=req.params

const result=await pool.query(`
    SELECT * FROM issues WHERE id=$1
    `,[id])
    const issue=result.rows[0]
   
    if(!issue){
         return sendResponse(res,{
    statusCode:404,
        success:false,
       message:"Issue Not Found",
       
    })
    }
    if(!req.user){
        throw new Error("Unauthorized!")
    }
    if(req.user.role==="maintainer"){
     return next()   
    }
    if(req.user.role==="contributor" &&
      req.body.status!==undefined
    ){
        return  sendResponse(res,{
    statusCode:403,
        success:false,
       message:"Contributor can not update status",
       
    })
    }
    if(req.user.role==="contributor" &&
      issue.status==="open"&&
      issue.reporter_id===req.user.id  
    ){
        return next()
    }
      return sendResponse(res,{
    statusCode:403,
        success:false,
       message:"Forbidden",
       
    })
}
catch(err:unknown){
next(err)
}
}