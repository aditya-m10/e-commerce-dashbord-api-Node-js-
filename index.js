const express=require("express");
const cors =require("cors")
require("./database/config") ; 
const User = require("./database/User")
const Product= require("./database/Product");
const { request } = require("express");
const app=express();
app.use(express.json())
app.use(cors({ origin: true })); // enable origin cors

app.post("/register",async (req,resp)=>{
    let user=new User(req.body)
    let result=await user.save()
    result=result.toObject();
    delete result.password
    resp.send(result)
})
app.post("/login",async (req,resp)=>{
    if (req.body.email && req.body.password){
    let user=await User.findOne(req.body).select("-password");
    if(user){
        resp.send(user)
    }
    else{
        resp.send({error:"No User Found"})
    }}
    else{
        resp.send({error:"Invalid credentials"})
    }
})

app.post("/addproduct",async(req,resp)=>{
    let product =new Product(req.body);
    if (req.body.name=="" || req.body.price=="" || req.body.category=="" || req.body.company==""){
        resp.send({error:"empty fields"})
    
} else{
    let result=await product.save();
    resp.send(result)
    }
})

app.get("/products",async (req,resp)=>{
    let products=await Product.find();
    if(products.length>0){
        resp.send(products)
    }else{
        resp.send({result:"No Product Found"})
    }
})
app.delete("/product/:id",async (req,resp)=>{
    console.log(req.body)
    let product=await Product.deleteOne({_id: req.body.id})
    resp.send({msg:"deleted"})
})

app.get("/product/:id",async (req,resp)=>{
    let result=await Product.findOne({_id:req.params.id})  //{brand: "iphone",price: "12000"}
    if (result){
        resp.send(result)
    }
    else{
        resp.send({msg:"No Record Found"})
    }
})
app.put("/update/:id",async (req,resp)=>{
    console.log(req.body)
    let result=await Product.updateOne({_id:req.params.id},{$set:req.body})
    resp.send(result)
})

app.get("/search/:key",async (req,resp)=>{
let result=await Product.find({
    "$or":[
        {name:{$regex:req.params.key}},
        {category:{$regex:req.params.key}},
        {company:{$regex:req.params.key}},
    ]
})
resp.send(result)
})
app.listen(5000)