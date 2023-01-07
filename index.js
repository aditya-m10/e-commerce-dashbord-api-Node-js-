const express = require("express");
const cors = require("cors");
require("./database/config");
require('dotenv').config();

const User = require("./database/User");
const Product = require("./database/Product");
const { request } = require("express");
const Jwt = require("jsonwebtoken");
const jwtKey = process.env.JWT_KEY; 
const app = express();
app.use(express.json());
app.use(cors({ origin: true })); // enable origin cors
const tokenVerification=(req,resp,next)=>{
    let token=req.headers["authorization"];
    console.log(token)
    if (token){
        Jwt.verify(token,jwtKey,(err,valid)=>{
            if (err){
                resp.send({result: "Provide valid token"})
            }else{
                next()
            }

        })
    }
    else{
        resp.send({result:"Please add token with header"})

    }
}
app.post("/register", async (req, resp) => {
  if (req.body.email) {
  let user = await User.findOne( { "email": req.body.email },).select("-password");
if(!user){
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  if (result) {
    Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
      if (err) {
        resp.send({ result: "something went wrong , try after sometime" });
      }
      resp.send({ result, auth: token });
    });
  }
}
if(user){
  resp.send({error :"Email already exist"})
}

}
});
app.post("/login", async (req, resp) => {
  if (req.body.email && req.body.password) {
    let user = await User.findOne(req.body).select("-password");

    if (user) {
      Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          resp.send({ result: "something went wrong , try after sometime" });
        }
        resp.send({ user, auth: token });
      });
    } else {
      resp.send({ error: "No User Found" });
    }
  } else {
    resp.send({ error: "Invalid credentials" });
  }
});

app.post("/addproduct",tokenVerification, async (req, resp) => {
  let product = new Product(req.body);

  if (
    req.body.name == "" ||    req.body.price == "" ||    req.body.category == "" ||    req.body.company == ""  ) {
    resp.send({ error: "empty fields" });
  } else {
    let result = await product.save();
    resp.send(result);
  }
});

app.get("/products",tokenVerification, async (req, resp) => {
  let products = await Product.find();
  if (products.length > 0) {
    resp.send(products);
  } else {
    resp.send({ result: "No Product Found" });
  }
});
app.delete("/product/:id",tokenVerification, async (req, resp) => {
  console.log(req.body)
  let product = await Product.deleteOne({ _id: req.body.id });
  resp.send({ msg: "deleted" });
});

app.get("/product/:id",tokenVerification, async (req, resp) => {
  let result = await Product.findOne({ _id: req.params.id }); //{brand: "iphone",price: "12000"}
  if (result) {
    resp.send(result);
  } else {
    resp.send({ msg: "No Record Found" });
  }
});
app.put("/update/:id",tokenVerification, async (req, resp) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    { $set: req.body }
  );
  resp.send(result);
});

app.get("/search/:key", tokenVerification, async (req, resp) => {
  let result = await Product.find({
    $or: [
      { name: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
      { company: { $regex: req.params.key } },
    ],
  });
  resp.send(result);
});

app.listen(5000);
