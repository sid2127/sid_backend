import dotenv from "dotenv"

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connnect_db from "./db/index.js";

dotenv.config({
    path: './env'
})


connnect_db()











// import express from "express";

// const app = express();


// ( async ()=> {
//     try {
//         await mongoose.connect(`${process.env.MongoDB_URI}/${DB_NAME}`)

//         app.on("error" , (error) => {            //if the database is connected but backend is not working , than to check that we use this
//             console.log("ERR :" , error);
//               throw error;
               ;
               
            
//         })
//         app.listen(process.env.PORT , ()=>{
//             console.log("App is listening on port:" , process.env.PORT);
            
//         })
        


//     } catch (error) {
//         console.error("Error :" , error);
//         throw error;     
//     }
    
// })()