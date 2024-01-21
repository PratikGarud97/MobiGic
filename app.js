const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;

//Connection to DB
mongoose.connect('mongodb://localhost:2701/EmployeeDB',{useNewUrlParser:true,useUndefinedTopology:true})

// User Model
const User = monoose.model('User',{
    username : String,
    password : String,
    uploadedFiles: [{filename:String,uniqueCode:Number}]
});

app.use(bodyParser.urlencoded({extend:true}));

// Register
app.post('/register', async(req,res)=>{
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password,10);

    const newUser = new User({username,password:hashedPassword});
    await newUser.save();
    res.status(200).send('Registration Done');
});

// Login
app.post('/login', async(req,res)=>{
    const {username,password} = req.body;
    if(user){
        const match = await User.findOne({username});
        if(match){
            res.send('Successfully Login')
        }
        else{
            res.status(401).send('Invalid Password');
        }
    }
    else{
        res.status(401).send('User not found');
    }
});

// Setup for File Upload
const storage = multer.diskStorage({
    destination: function (req,res,cb){
        cb(null,'uploads/');
    },
    filename:function(req,res,cb){
        const uniqueCode = Math.floor(100000 + Math.random()*9000000);
        const fileName = `${uniqueCode}_${file.originalname}`;
        cb(null,fileName);
    },
});

const upload = multer({storage:storage});

//File Upload
app.post('/upload',upload.single('file'),(req,res)=>{
    res.send('File upload Successfully')
});

//File Download
app.get('/download/:filename',(req,res)=>{
    const filePath = `uploads/${req.params.filename}`;
    if(fs.existsSync(filePath)){
        res.download(filePath);
    }
    else{
        res.status(404).send('File not found');
    }
});

// Get list of uploaded files
app.get('/user-files/:username', async(req,res)=>{
    const {username} = req.params;
    const user = await User.findOne({username});
    if(user){
        res.json(user.uploadedFiles);
    }
    else{
        res.status(404).send('User not found')
    }
})

// File Remove
app.delete('/remove/:filename',(req,res)=>{
    const filePath = `upload/${req.params.filename}`;
    if(fs.existsSync(filePath)){
        fs.unlinkSync(filePath);
        res.send('file removed successfully');
    }
    else{
        res.status(404).send('file not found')
    }
});

app.listen(port,()=>{
    console.log('Server Running');
})
