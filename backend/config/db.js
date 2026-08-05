// password=WHT052PJ7VnWe6C4
// username:sdswathi790_db_user

import mongoose from "mongoose";
export const connectDB=async()=>{
    await mongoose.connect('mongodb://sdswathi790_db_user:WHT052PJ7VnWe6C4@ac-ummnoup-shard-00-00.brjgqbo.mongodb.net:27017,ac-ummnoup-shard-00-01.brjgqbo.mongodb.net:27017,ac-ummnoup-shard-00-02.brjgqbo.mongodb.net:27017/BiteRush?ssl=true&replicaSet=atlas-r92v4r-shard-0&authSource=admin&appName=Cluster0').then(()=>console.log("DB connected"))
}