import { pool } from "../../db"
import type { Iissue } from "./issue.interface"
import type { ITypes } from "./issues.types"

const createIssueIntoDB=async(payload:Iissue,reporterId:number)=>{
const {title,description,type}=payload
    const result =await pool.query(`
    INSERT INTO issues(
    title,description,type,reporter_id
    ) VALUES($1,$2,$3,$4) RETURNING *
    
    `,[title,description,type,reporterId])
    return result
}
const getAllIssueFromDB=async(payload:ITypes)=>{
const {sort,type,status}=payload
    const conditions=[];
         const value=[];
             if(type){
  value.push(type)  
  conditions.push(`type=$${value.length}`)
}
       if(status){
  value.push(status)  
  conditions.push(`status=$${value.length}`)
}

let query=`SELECT * FROM issues` ;
 

        
if(conditions.length>0){
    query +=` WHERE ${conditions.join(" AND ")}`
}

if(sort ==="oldest"){
    query += ` ORDER BY created_at ASC`
}
else{
    query +=` ORDER BY created_at DESC`
}
const result=await pool.query(query,value)
        const  reporterId=[
            ...new Set(result.rows.map(issue=>issue.reporter_id))
        ]
   
  
        const userResult=await pool.query(`
           SELECT id,name,role
           FROM users
           WHERE id=ANY($1)
            `,[reporterId])
            const users=new Map()
            userResult.rows.forEach(user=>{
                users.set(user.id,user)
            })

            const issuesWithReportrDetail=result.rows.map(issue=>({
id:issue.id,
title:issue.title,
description:issue.description,
type:issue.type,
status:issue.status,
reporter:users.get(issue.reporter_id),
created_at:issue.created_at,
updated_at:issue.updated_at,
            }))
            return issuesWithReportrDetail

}
const getSingleIssueFromDB=async(id:string)=>{
const result=await pool.query(`
    SELECT * FROM issues WHERE id=$1
    `,[id])
    const  reporterId=[
            ...new Set(result.rows.map(issue=>issue.reporter_id))
        ]
        const userResult=await pool.query(`
           SELECT id,name,role
           FROM users
           WHERE id=ANY($1)
            `,[reporterId])
            const users=new Map()
            userResult.rows.forEach(user=>{
                users.set(user.id,user)
            })

            const issuesWithReportrDetail=result.rows.map(issue=>({
id:issue.id,
title:issue.title,
description:issue.description,
type:issue.type,
status:issue.status,
reporter:users.get(issue.reporter_id),
created_at:issue.created_at,
updated_at:issue.updated_at,
            }))
            return issuesWithReportrDetail
}
const updateIssueFromDB=async(payload:Iissue,id:string)=>{
const {title,description,type,status}=payload
const result=await pool.query(`
    UPDATE issues
    SET
   
    title=COALESCE($1,title),
    description=COALESCE($2,description),
    type=COALESCE($3,type),
    status=COALESCE($4,status)
   WHERE id=$5 RETURNING *

    `,[title,description,type,status,id])
    console.log("payload",payload)
    console.log("status",status)
    return result
}
const deleteIssueFromDB=async(id:string)=>{
const result=await pool.query(`
    DELETE FROM ISSUES WHERE id=$1`,[id])
    return result
}
export const issueService={
    createIssueIntoDB,
    getAllIssueFromDB,
    getSingleIssueFromDB,
    updateIssueFromDB,
    deleteIssueFromDB
}