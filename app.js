require('dotenv').config();
const express = require('express');
const exphbs  = require('express-handlebars');
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require("passport-local-mongoose");


const timestamps = require('mongoose-timestamp');

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:true}));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(session({
   secret: "ourlittlesecret",
   resave: false,
   saveUninitialized: false,
 }));
 app.use(passport.initialize());
 app.use(passport.session());

app.get("/",function(req,res){
  res.render("home");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/logout",function(req,res){
  res.render("logout");
});

mongoose.connect('mongodb://localhost:27017/registerDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  name:String,
  mobile:Number,
  address:String,
  city:String,
  pincode:Number,
  state:String,
  userName:String,
  password:String},
  {timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }}
);
userSchema.plugin(timestamps);
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User",userSchema);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// app.post("/register",function(req,res){
//   const user = new User({
//     Name:req.body.Fname,
//     Mobile:req.body.number,
//     Address:req.body.address,
//     City:req.body.city,
//     Pincode:req.body.pincode,
//     State:req.body.state,
//     UserName:req.body.username,
//     Password:req.body.password
//   });
//   user.save(function(err){
//     if(err){
//       console.log(err);
//     } else{
//       res.render("succes",{Time:user.createdAt});
//     }
//   });
// });
app.post('/register', passport.authenticate('local' , {
successRedirect : '/succes',
failuerRedirect : '/register',
failuerFlash: true
}));
passport.use('register', new localStrategy({
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
         Name = req.body.Fname;
         Mobile = req.body.number;
         Address = req.body.address;
         City = req.body.city;
         Pincode = req.body.pincode;
         State = req.body.state;
    const user = await User.create({Fname,number,address,city,pincode,state,email,password});
    return done(null, user);
  } catch (error) {
    done(error);
  }
}));










app.post("/login",function(req,res){
  const email = req.body.username;
  const pwd = req.body.password;
  console.log(email);
   User.findOne({UserName:email},function(err,foundUser){
     if(err){
       console.log(err);
     }else{
       if(foundUser){
         console.log(foundUser);
            if(foundUser.Password === pwd){
              console.log(foundUser.createdAt);
              res.render("succes",{Time:foundUser.createdAt});
            }else{
               res.render("wrongPassword");
            }
       }
       else{
         res.render("failure");
       }
     }
   });
});

app.post("/logout",function(req,res){
    const mail = req.body.username;
    User.findOne({UserName:mail},function(err,foundUser){
      if(err){
        console.log(err);
      }else{
        if(foundUser){
          const startingTime = foundUser.createdAt.getTime()/1000;
          const presentTime = Math.round(new Date().getTime()/1000);
          const totalTime = Math.round(((presentTime-startingTime)/(60*60))*100)/100;
          res.render("successfullylogout",{Time:totalTime});
        }else{
          res.render("failure");
        }
      }
    });
});

app.listen(3000,function(){
  console.log("running");
});
