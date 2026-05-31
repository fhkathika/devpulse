import  express, { type Request, type Response } from 'express'
import config from './config'
import { initDB } from './db'
import app from './app'
const port=config.port
const main=()=>{
  initDB();
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
}
main()


