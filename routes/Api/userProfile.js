var express = require('express');
const router = express.Router();
const env = require('dotenv/config');
const AWS = require('aws-sdk');
const db = require('../../src/Utils/dbConfig');
const UserProfileController = require('../../src/Api/Controllers/UserProfileController');
const UserProfileService = require('../../src/Api/services/UserProfileService');
const UserController = require('../../src/Api/Controllers/UserController');

/********************* FILE UPLOAD AND STORAGE CONFIG ******************************/
var Multer = require('multer');
var userpostStorage = Multer.memoryStorage({
    destination: function (req, file, cb) {
        // Uploads is the Upload_folder_name
        //cb(null, req.app.get('env') === 'development'?process.env.FILE_UPLOAD_POSTS_TEST:'');
        cb(null,'');
    },
    /*filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now()+".jpg")
    }*/
});

const fileFilter = (req,file,cb) =>{
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg') {
        req.file_error = "file not allowed";
        return cb(null,true);
    }
    cb(null, true);
}

const uploadPost = Multer({
    storage: userpostStorage,
  /*  limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
    },
    fileFilter:fileFilter*/
}).single('file');

/****************************************************************************************/
/********************** AWS SETUP FOR SERVER FILE UPLOAD ******************************/
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY
})

/*********************************************************************************************/

/************ set user prfile ***************/
router.post('/setUserProfile',uploadPost,async function(req, res, next) {
  console.log('ROUTE::--->saveUserProfile called');
  var response = {status:'success',message:'',body:[]};
  try{
    if(req.file){
      var fileName = '';
      var filePath = '';
      if(req.hasOwnProperty('file_error')){
        response.status = 'failed';
        response.message = req.file_error;
        res.send(response)
      }else{
        let myFile = req.file.originalname.split(".")
        const fileType = myFile[myFile.length - 1]
        fileName = `${req.file.fieldname}-${Date.now()}.${fileType}`;
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: req.file.buffer
        }
        s3.upload(params,async (err,data)=>{
          if(err){
            response.status = 'failed';
            response.message = 'file upload failed';
            console.log(err);
            res.send(response);
          } else {
            console.log(data);
            filePath = data.Location;
            fileName = data.key;
            var userProfileData = {
              userId:req.body.userId,
              //fileName:fileName,
              filePath:filePath
            }
            let resp = await UserProfileController.saveUserProfile(userProfileData);
            if(resp.message == 'success'){
              resp.body = {profileimgurl:filePath};
            }
            response = resp;
            res.send(response);
          }
        });//s3
      }//else
    }else{
      response.status = 'failed';
      response.message = 'file not found';
      res.send(response);
    }
  }catch(ex){
    response.status = 'failed';
    response.message = 'exception occured';
    res.send(response);
    console.log(ex);
  }
  console.log('ROUTE::--->saveUserProfile end');
  //res.send(response);
});

/**************** follower route ***********************/
router.post('/requestfollow',async (req,res,next)=>{
  console.log('ROUTE::: follow Request starts...');
  var response = {status:'',message:'',body:[]};
  try {
    const { userId, toFollow } = req.body;
    if(userId && toFollow ){
      response = await UserProfileController.addFollowing(userId,toFollow);
    }else{
      response.message = 'internal server error'
    }
  } catch (e) {
    response.message = 'error';
    console.log(e);
  } finally {
    if(response.message === 'success'){
      response.status = 'success';
    }else {
      response.status = 'failed';
    }
  }
  res.send(response);
})

/**************** follower route ***********************/
router.post('/unfollow',async (req,res,next)=>{
  console.log('ROUTE::: follow Request starts...');
  var response = {status:'',message:'',body:[]};
  try {
    const { userId, toUnFollow } = req.body;
    if(userId && toUnFollow ){
      response = await UserProfileController.unfollowUser(userId,toUnFollow);
    }else{
      response.message = 'internal server error'
    }
  } catch (e) {
    response.message = 'error';
    console.log(e);
  } finally {
    if(response.message === 'success'){
      response.status = 'success';
    }else {
      response.status = 'failed';
    }
  }
  res.send(response);
})

/************ get all peoples ***************/
router.get('/getAllUsers',async function(req, res, next) {
  console.log('ROUTE::--->getAllUsers start');
  var response = {status:'success',message:'',body:[]};
  if(req.query.userId){
    try {
      response = await UserProfileController.getAllUsers(req.query.userId);
      res.status(200).send(response);
    } catch (e) {
      console.log(e);
      response.status = 'failed';
      response.message = 'error';
      res.status(400).send(response);
    }
  }else{
      response.status = 'failed';
      res.status(400).send(response);
  }
  console.log('ROUTE::--->getAllUsers end');
});

/************ get all peoples by search ***************/
router.post('/searchPeople',async function(req, res, next) {
  console.log('ROUTE::--->searchPeople start');
  var response = {status:'success',message:'',body:[]};
  const userId = req.body.userId;
  const searchVal = req.body.searchVal;
  if(userId && searchVal){
    try {
      response = await UserProfileService.searchPeople(searchVal,userId);
      res.status(200).send(response);
    } catch (e) {
      console.log(e);
      response.status = 'failed';
      response.message = 'error';
      res.status(400).send(response);
    }
  }else{
      response.message = 'Invalid data entry';
      response.status = 'failed';
      res.status(400).send(response);
  }
  console.log('ROUTE::--->searchPeople end');
});


/************ get user profile ***************/
router.get('/getUserProfile',async function(req, res, next) {
  console.log('ROUTE::--->getUserProfile start');
  var response = {status:'success',message:'',body:[]};
  if(req.query.userId){
    try {
      response = await UserProfileService.getUserProfile(req.query.userId);
      let posts = response.body && response.body.posts?response.body.posts:[];
      response.body.posts = posts.length > 0 ? posts.filter(p => p.posttype === 1) : [];
      res.status(200).send(response);
    } catch (e) {
      console.log(e);
      response.status = 'failed';
      response.message = 'error';
      res.status(500).send(response);
    }
  }else{
      response.status = 'failed';
      res.status(400).send(response);
  }
  console.log('ROUTE::--->getUserProfile end');
});

/************ update user profile ***************/
router.post('/updateProfile',async function(req, res, next) {
  console.log('ROUTE::--->updateProfile start');
  var response = {status:'success',message:'',body:[]};
  var userData = req.body;
  var message = '';
  if(!userData.userId && !userData.newUserId){
    message = 'userId required';
  }else if(!userData.userName){
    message = 'userName required';
  }
  if(userData.dob){
    if(userData.dob.split('/').length === 3){
      if(parseInt(userData.dob.split('/')[1]) > 12){
        message = "Invalid Date Format Currrect Format is dd/mm/yyyy";
      }
		}else{
      message = "Invalid Date Format Currrect Format is dd/mm/yyyy";
    }
  }
  if(message == ''){
    if(userData.userId && userData.userName  && userData.newUserId){
      try {
        response = await UserProfileController.updateProfileDetails(req.body);
      } catch (e) {
        console.log(e);
        response.message = 'error';
      }
    }else{
      response.message = 'Invalid data';
    }
  }else {
    response.message = message;
  }
  if(response.message == 'success'){
    response.status = 'success';
    response.status = 'success';
  }else {
    response.status = 'failed';
  }
  console.log('ROUTE::--->updateProfile end');
  res.send(response);
});

router.get('/getfollowers',async function (req,res) {
  var userId = req.query.userId;
  var response = {message:'',body:[]};
  try {
    response = await UserProfileService.getFollowers(userId);
  } catch (e) {
    console.log(e);
  }
  res.send(response);
});

router.get('/getfollowings',async function (req,res) {
  var userId = req.query.userId;
  var response = {message:'',body:[]};
  try {
    response = await UserProfileService.getFollowings(userId);
  } catch (e) {
    console.log(e);
  }
  res.send(response);
});

module.exports = router;
