import express from "express"
import "dotenv/config";
import { connectDB } from "./configs/db.js";
import billingRouter from "./routes/billing.route.js";




const app= express();

app.use(express.json())

app.get("/", (req,res)=>{
    res.send("hello from billing service")             //it is a controller
})
 
const PORT = process.env.PORT || 6005

app.use("/", billingRouter)




app.listen(PORT, ()=>{
    console.log(`billing service started on ${PORT}`)
    connectDB(); 
}) 

