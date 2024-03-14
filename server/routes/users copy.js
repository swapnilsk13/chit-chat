const express = require('express');


const routes = express.Router();
const UserModel = require('../models/user')
const bcrypt = require('bcrypt');

//dummy api for testing
routes.get('/dummyApi',(req,res)=>{
    res.send("dummy Api is working")
})


//user login apiroutes/users.js

routes.get('/login',(req,res)=>{
    //validate user request body (username and password)
    console.log(req.body);
    if(!req.body.userName || !req.body.password){
        res.status(400).send("username and password is required or cannot be empty")
    }
    else{
        //validate from mongodb
    }
})


//signup api
routes.post('/signup',(req,res)=>{
    console.log(req.body);
    if(!req.body.name || !req.body.userName || !req.body.password){
        res.status(400).send("name, username and password is required")
    }
    else{
            const newUser = new UserModel({
            name:req.body.name,
            userName:req.body.userName,
            password:req.body.password
        })
        newUser.save()
        .then(user =>{
            console.log(user);
            //below line is for send whole user
            // res.send(user)
            //filter
            res.json({
                success:true,
                name:user.name,
                userName:user.userName,
                id:user._id
            })
        })
    }
})


module.exports = routes;