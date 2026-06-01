import bcrypt from "bcryptjs";
import { pool } from "../../db";
import config from "../../config";
import jwt, { type JwtPayload } from "jsonwebtoken"
const loginIntoDB=async(payload:{
    email:string;
    password:string;
})=>{
const {email,password}=payload;
const userData=await pool.query(`
    
    SELECT * FROM users WHERE email=$1`,
[email]);
const user=userData.rows[0]
if(userData.rows.length===0){
    throw new Error("Invalid Credintial!")

}
const matchPassword=await bcrypt.compare(password,user.password);
if(!matchPassword){
    throw new Error("Invalid Credintial!")
}
//generate token
const jwtPayload={
    id:user.id,
    email:user.email,
    name:user.name,
    role:user.role
}
const token=jwt.sign(jwtPayload,config.secret as string,{
    expiresIn:"1d"

})
return {token,

    user:{
    id:user.id,
    email:user.email,
    name:user.name,
    role:user.role,
    created_at:user.created_at,
    updated_at:user.updated_at
    }
}
}

export const authService={
    loginIntoDB
}