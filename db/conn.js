const mongoose = require("mongoose");

const DB = process.env.DB;

mongoose.set("strictQuery",true);
mongoose.connect(DB,{
    useUnifiedTopology:true,
    useNewUrlParser:true
}).then(() => console.log("Database Connected")).catch((err)=>{
    console.log(err);
});