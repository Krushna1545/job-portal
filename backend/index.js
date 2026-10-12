import express from 'express'
import cookieParser from 'cookie-parser';
import cors from "cors" ;
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
dotenv.config({});
const app = express();


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const PORT = process.env.PORT || 5001;

const corsOption = {
    origin : ["http://localhost:5121"],
    Credentials : true,
};
app.use(cors(corsOption));

app.listen(PORT,()=>{
    connectDB();
    console.log(`server is running on PORT ${PORT}`);
});
