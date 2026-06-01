import type { NextFunction, Request, Response } from "express"
import config from "../config";
import jwt, { type JwtPayload } from "jsonwebtoken"
import { pool } from "../db";
import type { ROLES } from "../Types";
import sendResponse from "../utility/serverResponse";


const auth=(...roles:ROLES[])=>{
    return async (req:Request,res:Response,next:NextFunction)=>{
console.log(roles)
      try{
// console.log("this is protected route")
const token=req.headers.authorization;
if(!token){
  return sendResponse(res,{
    statusCode:401,
        success:false,
       message:"Unauthrized!!",
       
    })
  
}
 const decoded=jwt.verify(token as string,config.secret as string) as JwtPayload
console.log("decode",decoded)
const userData=await pool.query(`
    SELECT * FROM users WHERE email=$1`,[decoded.email])
   
    const user=userData.rows[0]
  if(userData.rows.length===0){
return sendResponse(res,{
    statusCode:404,
        success:false,
       message:"Users not found",
       
    })
  }
 
 if(roles.length && !roles.includes(user.role)){
   return sendResponse(res,{
    statusCode:403,
        success:false,
       message:"Forbidden",
       
    })



 }
  req.user=decoded;
next()
}
catch(err){
next(err)
}
}
}
export default auth