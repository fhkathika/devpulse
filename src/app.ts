import express, { type Application, type Request, type Response } from "express"
import { userRoute } from "./modules/users/users.route"
import { authRouter } from "./modules/auth/auth.route"
import { issueRoute } from "./modules/issues/issue.route"


const app:Application = express()

app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({extended:true}))


app.get('/', (req:Request, res:Response) => {
//   res.send('Hello World')
res.status(200).json({
    "message":"Express Server",
    "author":"next level",

})
})
app.use('/api/auth/signup',userRoute)
app.use('/api/auth',authRouter)
app.use('/api/issues',issueRoute)


export default app
