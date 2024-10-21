const express = require("express");
const debuglog = require("debug")("app:");
const cookieParser = require("cookie-parser");
const path = require("path");

const mongooseConnection = require("./config/mongoose");

const userModel = require("./models/user");
const hisaabModel = require("./models/hisaab");
const { log } = require("console");

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", isAuthenticated, async function (req, res) {
  let { hisaabs } = await userModel
  .findOne({email: req.cookies.email})
  .populate("hisaabs");  

  res.render("index", {hisaabs});
});


app.get("/createnewhisaab", isAuthenticated ,function(req, res){
  res.render("createnewhisaab")
})


app.get("/viewhisaab:hisaabid", isAuthenticated, async function(req, res){
  const hisaabs = await hisaabModel.findOne({_id: req.params.hisaabid})  
  res.render("viewhisaab", {hisaabs})
})

app.get("/deletehisaab/:hisaabid",  isAuthenticated, async function(req, res){
  const hisaabsdelete = await hisaabModel.findOneAndDelete({_id: req.params.hisaabid});
  console.log("s");
  if (hisaabsdelete) {
    res.redirect("/")
    console.log(hisaabsdelete);
    
  }
  else{
    res.status(500).send("user not delete")
  }

})

// Logout

app.get("/logout", function(req,res){
  res.clearCookie('isAuthenticated');
  res.redirect("/signin")
})

app.get("/signin", function (req, res) {
  res.render("signin");
});

app.get("/signup", function (req, res) {
  res.render("signup");
});


// POST ROUTES


// SIGNIN

app.post("/signin", async function(req, res){
  try {
    const {email, password} = req.body;
    const user = await userModel.findOne({email: email, password: password})
    if(user){
      debuglog("user signin succesfully")
      res.cookie("isAuthenticated", "true")
      res.cookie("email", `${email.toString()}`)      
      res.redirect("/")      
    }
    else{
      debuglog("user not definde")
      res.redirect("/signin")
    }
  } catch (error) {
    debuglog("user not definde",  error)
    res.redirect("/signin")
  }

})

// SIGNUP

app.post("/signup", async function(req, res){
  try {
    const {name, email, password} = req.body;
    const user = await userModel.create({name: name, email: email, password: password})
    if(user){
      debuglog("user created succesfully")
      res.redirect("/signin")
    }
    else{
      debuglog("user not created")
      res.redirect("/signup")
    }
    
  } catch (error) {
    debuglog("user not created", error)
    res.status(500).send("Server Error")
  }
})


// CREATENEWHISAAB

app.post("/createnewhisaab", async function(req, res){
  try {
    const {title, desc} = req.body;
    const user = await userModel.findOne({email: req.cookies.email})
    if(user){
      const hisaab = await hisaabModel.create({title: title, desc: desc, user: user._id});
      user.hisaabs.push(hisaab._id)
      await user.save();
      debuglog("new hisaab created succesfully");
      res.redirect("/");
    }
    else{
      debuglog("new hisaab not created");
      res.redirect("/createnewhisaab");
    }
  } catch (error) {
    debuglog("new hisaab not created", error)
    res.status(500).send("Server Error")
  }
})


// isAuthenticated

function isAuthenticated (req, res, next) {
try {
  let token = req.cookies.isAuthenticated
  if(token){
    debuglog("user isAuthenticated")
    next()
  }
  else{
    debuglog("user not authenticated")
    res.redirect("/signin")
  }

} catch (error) {
  debuglog("user not authenticated")
  res.static(500).send("Server Error", error)
}
}

app.listen(3000)
