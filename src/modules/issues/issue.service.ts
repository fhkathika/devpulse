import { pool } from "../../db"
import type { Iissue } from "./issue.interface"

const createIssueIntoDB=async(payload:Iissue,reporterId:number)=>{
const {title,description,type}=payload
    const result =await pool.query(`
    INSERT INTO issues(
    title,describtion,type,reporter_id
    ) VALUES($1,$2,$3,$4) RETURNING *
    
    `,[title,description,type,reporterId])
    return result
}
export const issueService={
    createIssueIntoDB
}