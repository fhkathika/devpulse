import { pool } from "../../db"
import type { Iissue } from "./issue.interface"

const createIssueIntoDB=async(payload:Iissue,reporterId:number)=>{
const {title,description,type}=payload
    const result =await pool.query(`
    INSERT INTO issues(
    title,description,type,reporter_id
    ) VALUES($1,$2,$3,$4) RETURNING *
    
    `,[title,description,type,reporterId])
    return result
}
const getAllIssueFromDB=async()=>{

    const result=await pool.query(`
        
        SELECT * FROM issues
         `)
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
export const issueService={
    createIssueIntoDB,
    getAllIssueFromDB
}