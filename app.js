const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv")
dotenv.config({path:"./config.env"});
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");


require("./db/conn");

const router = require("./routes/router")

app.use(express.json());

app.use(cors({
    origin: true,
    credentials: true,
  }));
app.use(router);
app.use(cookieParser());



app.listen(PORT,()=>{
    console.log("server strated at port: "+PORT);
});