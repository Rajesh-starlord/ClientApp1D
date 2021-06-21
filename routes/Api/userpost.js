var express = require('express');
const router = express.Router();
const env = require('dotenv/config');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const db = require('../../src/Utils/dbConfig');
const UserPostController = require('../../src/Api/Controllers/UserPostController');
const UserPostService = require('../../src/Api/services/UserPostService');
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

/************ post ***************/
router.post('/userpost',uploadPost,async function(req, res, next) {
  console.log('ROUTE::--->savePost called');
  var response = {status:'success',message:'',body:[]};
  try{
    if(req.file){
      var fileName = '';
      var filepath = '';
      if(req.hasOwnProperty('file_error')){
        response.status = 'failed';
        response.message = req.file_error;
        res.send(response)
      }else{
        /*if(req.app.get('env') === 'development'){
          fileName = req.file.filename;
          filepath = req.file.path.replace('public','');
        }else{*/
          //console.log(req.file);
          //console.log(req);
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
            }else {
              filePath = data.Location;
              fileName = data.key;
              var userPostData = {
                postTitle:req.body.postTitle,
                postDesc:req.body.postDesc,
                fileName:fileName,
                filePath:filePath,
                postedBy:req.body.postedBy,
                activity:req.body.activity!=='' && req.body.activity !== 'undefined'?parseInt(req.body.activity):1,
                postType:1
              }
              try{
                response = await UserPostController.savePost(userPostData);
                console.log(response);
              }catch(e){
                console.log(e);
                response.status = 'failed';
                response.message = 'file upload failed';
              }
              res.send(response);
            }
        });
        //}else
      }
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
  console.log('ROUTE::--->savePost end');
  //res.send(response);
});

/************ post-text ***************/
router.post('/posttext',uploadPost,async function(req, res, next) {
  console.log('ROUTE::--->savePost-text called');
  var response = {status:'success',message:'',body:[]};
  try{
    var userPostData = {
        postTitle:req.body.postTitle,
        postDesc:req.body.postDesc,
        fileName:req.body.textToPost,
        filePath:'',
        postedBy:req.body.postedBy,
        activity:req.body.activity,
        postType:2
      }
      response = await UserPostController.savePost(userPostData);
  }catch(ex){
    response.status = 'failed';
    response.message = 'exception occured';
    console.log(ex);
  }
  console.log('ROUTE::--->savePost-text end');
  res.send(response);
});

/************ post-Activities ***************/
router.get('/activities',async function(req, res, next) {
  console.log('ROUTE::--->getActivities start');
  var response = {status:'success',message:'',body:[]};
  try {
    response = await UserPostController.getActivities();
  } catch (e) {
    console.log(e);
    response.status = 'failed';
    response.message = 'error';
  }
  console.log('ROUTE::--->getActivities end');
  res.send(response);
});

/************getAllPosts***************/
router.get('/getAllPosts',async function(req, res, next) {
  console.log('ROUTE::--->getAllPosts called');
  var response = {status:'success',message:'',body:[]};
  var userid = req.query.userid;
  var start = req.query.page ? req.query.page : 1;
  try {
    response = await UserPostController.getAllPosts(userid,start);
  } catch (e) {
    response.message = 'exception occured';
    console.log(e);
  } finally {
    if(response.message == ''){
      response.message = 'success';
      response.status = 'success';
      response.CurrentPage = parseInt(start);
    }else{
      response.status = 'failed';
    }
  }
  res.send(response);
});

/************ like a  post ***************/
router.post('/likepost',async function(req, res, next) {
  console.log('ROUTE::--->Like Post called');
  var response = {status:'success',message:'',body:[]};
  try {
    const { postId,likedBy } = req.body;
    if(postId,likedBy){
        response = await UserPostController.addLike(postId,likedBy);
    }else {
      response.message = 'internal Error';
    }
  } catch (e) {
    response.message = 'exception occured';
    console.log(e);
  } finally {
    if(response.message == 'success'){
      response.status = 'success';
    }else{
      response.status = 'failed';
    }
  }
  res.send(response);
});

/************ remove like from a post ***************/
router.post('/removelike',async function(req, res, next) {
  console.log('ROUTE::--->Remove Like From  Post called');
  var response = {status:'success',message:'',body:[]};
  try {
    const { postId,likeRemovedBy } = req.body;
    if(postId,likeRemovedBy){
        response = await UserPostController.removeLike(postId,likeRemovedBy);
    }else {
      response.message = 'internal Error';
    }
  } catch (e) {
    response.message = 'exception occured';
    console.log(e);
  } finally {
    if(response.message == 'success'){
      response.status = 'success';
    }else{
      response.status = 'failed';
    }
  }
  res.send(response);
});

/************ dislike a  post ***************/
router.post('/dislikepost',async function(req, res, next) {
  console.log('ROUTE::--->DisLike Post called');
  var response = {status:'success',message:'',body:[]};
  try {
    const { postId, dislikedBy } = req.body;
    if(postId,dislikedBy){
        response = await UserPostController.addDisLike(postId,dislikedBy);
    }else {
      response.message = 'internal Error';
    }
  } catch (e) {
    response.message = 'exception occured';
    console.log(e);
  } finally {
    if(response.message == 'success'){
      response.status = 'success';
    }else{
      response.status = 'failed';
    }
  }
  res.send(response);
});

/************ remove dislike from a post ***************/
router.post('/removedislike',async function(req, res, next) {
  console.log('ROUTE::--->Remove disLike From  Post called');
  var response = {status:'success',message:'',body:[]};
  try {
    const { postId,dislikeRemovedBy } = req.body;
    if(postId && dislikeRemovedBy){
      response = await UserPostController.removeDisLike(postId,dislikeRemovedBy);
    }else {
      response.message = 'internal Error';
    }
  } catch (e) {
    response.message = 'exception occured';
    console.log(e);
  } finally {
    if(response.message == 'success'){
      response.status = 'success';
    }else{
      response.status = 'failed';
    }
  }
  res.send(response);
});

/************ raddcomment to a post ***************/
router.post('/addcomment',async function(req, res, next) {
  console.log('ROUTE::--->addcomment to Post called');
  var response = {status:'success',message:'',body:[]};
  try {
    const { postId,comment,commentBy } = req.body;
    if(postId && comment && commentBy){
      response = await UserPostService.addComment(postId,comment,commentBy);
    }else {
      response.message = 'internal Error...provide valid data';
    }
  } catch (e) {
    response.message = 'exception occured';
    console.log(e);
  } finally {
    if(response.message == 'success'){
      response.status = 'success';
    }else{
      response.status = 'failed';
    }
  }
  res.send(response);
});

/************ raddcomment to a post ***************/
router.get('/getcomments',async function(req, res, next) {
  console.log('ROUTE::--->addcomment to Post called');
  var response = {status:'success',message:'',body:[]};
  try {
    const { postId } = req.query;
    if(postId){
      response = await UserPostService.getComments(postId);
    }else {
      response.message = 'internal Error...provide valid data';
    }
  } catch (e) {
    response.message = 'exception occured';
    console.log(e);
  } finally {
    if(response.message == 'success'){
      response.status = 'success';
    }else{
      response.status = 'failed';
    }
  }
  res.send(response);
});

router.post('/deletePost',async function (req,res) {
  var postid = req.body.postId;
  var userid = req.body.userId;
  var response = {message:'',status:'',body:[]};
  if(postid && userid){
    try {
      response = await UserPostService.deletePost(postid,userid);
    } catch (e) {
      response.message = 'internal server error...';
      response.status = 'failed';
      console.log(e);
    }
  }else {
    response.message = 'Error!! please try after some time.';
    response.status = 'failed';
  }
  //response.message = 'Action.Can\'t proceed,Feature under process';
  //response.status = 'failed';
  res.send(response);
});

router.get('/getlikes', async function (req, res) {
  console.log('ROUTE::get Likes called');
  var postid = req.query.postid;
  var response = { message: '',status:'', body: [] };
  try {
      response = await UserPostService.getLikes(postid);
  } catch (e) {
      response.message = response.status = "error";
      console.log(e);
  }
  console.log('ROUTE::get Likes end');
  res.send(response);
});

module.exports = router;
