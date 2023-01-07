const mongoose=require("mongoose");
require('dotenv').config();
const uri=process.env.DB_CONNECTION
mongoose.pluralize(null);
mongoose.connect(uri);


   