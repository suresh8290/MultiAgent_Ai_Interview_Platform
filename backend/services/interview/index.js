
import express from "express"
import "dotenv/config";
import { connectDB } from "./config/db.js";
import interviewRouter from "./routes/interview.route.js";



const app= express();

app.use(express.json())
app.use(express.urlencoded({extended:true}));

 
const PORT = process.env.PORT || 6003

app.get("/", (req,res)=>{
    res.send("hello from interview service")             //it is a controller
})

app.use("/", interviewRouter)

app.listen(PORT, ()=>{
    console.log(`interview service started on ${PORT}`)
    connectDB(); 
}) 

