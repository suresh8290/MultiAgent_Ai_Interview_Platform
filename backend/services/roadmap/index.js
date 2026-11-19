import express from "express"
import "dotenv/config";
import { connectDB } from "./configs/db.js";
import roadmapRouter from "./routes/roadmap.route.js";



const app= express();

app.use(express.json())
app.use(express.urlencoded({extended:true}));

 
const PORT = process.env.PORT || 6004

app.use("/", roadmapRouter)


app.listen(PORT, ()=>{
    console.log(`roadmap service started on ${PORT}`)
    connectDB(); 
}) 

