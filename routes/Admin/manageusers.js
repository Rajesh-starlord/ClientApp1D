var express = require('express');
var router = express.Router();
const dbService = require('../../src/services/dbService');
const UserProfileService = require('../../src/Api/services/UserProfileService');
const UserPostService = require('../../src/Api/services/UserPostService');
const RewardService = require('../../src/Api/services/RewardService');
const { base64encode, base64decode } = require('nodejs-base64');

/********************* MANAGE CONTENTS ROUTES ********************************/

router.get('/viewusers',function (req,res) {
    res.render('admin/manageusers',{message:req.session.contentMessage});
})

router.get('/viewusers-throughAjax',async function (req,res) {

  let param1 = req.query.param1;
  let draw = req.query.draw;
  let start = req.query.start;
  let length = req.query.length;
  console.log(start,length);
  let sql1 = 'select count(*) as count from userdetail';
  if(param1!=null && param1!=''){
    sql1+=' where userid =\''+param1+'\'';
  }
  const query1 = {
    text: sql1,
    values:[]
  }
  var result = await dbService.execute(query1);
  var total =result[0].count;

  let sql = 'select * from userdetail';
  if(param1!=null && param1!=''){
    sql += ' where userid =\''+param1+'\'';
  }
  sql += ' offset $1::integer limit $2::integer';
  const query = {
    text: sql,
    values:[start,length],
    rowAsArray: true
  }
  var icon = {
    official:'fa fa-check-circle',
    acitiveuser:'fa fa-check',
  }
  var data = await dbService.execute(query);
      data.forEach((item,i) => {
        if(parseInt(item.isofficial) == 1){
          item.isofficial = 'Yes';
          icon.official = 'fa fa-exclamation-circle';
        }else{
          item.isofficial = 'No';
          icon.official = 'fa fa-check-circle';
        }
        icon.acitiveuser = item.status === 'Active'?'fa fa-times':'fa fa-check';
        item.action = '&nbsp&nbsp;<a href="jacvascript:void;" onclick=changeOfficialStatus(\''+base64encode(item.userid)+'\',\''+item.isofficial+'\')><i class="'+icon.official+'"></i></a>'+
                      '&nbsp&nbsp;<a href="jacvascript:void;" onclick=changeUserStatus(\''+base64encode(item.userid)+'\',\''+item.status+'\')><i class="'+icon.acitiveuser+'"></i></a>'+
                      '&nbsp&nbsp;<a href="viewusers-profile?userid='+base64encode(item.userid)+'"><i class="fa fa-search"></i></a>';
      });
      contents = {data:data}
      contents.recordsTotal = total;
      contents.recordsFiltered = total;
      contents.draw = parseInt(draw);
      res.send(contents);
})

router.get('/viewusers-profile',async function (req,res) {
  var userId = req.query.userid;
  var returnUrl = req.query.returnUrl;
  userId = base64decode(userId);
  var userProfile = {};
  try {
    let response = await UserProfileService.getUserProfile(userId);
    if(response.message == "success"){
      userProfile = response.body;
      userProfile.gender = userProfile.gender == '1'?'Male':'Female';
      let resp= await RewardService.getRewardDetails(userId);
      userProfile.reward = resp.body.RewardDetails;
    }
  } catch (e) {
    console.log(e);
  }
  res.render('admin/viewuserprofile',{user:userProfile,returnUrl:returnUrl?'/admin/rewardDetails':'/admin/viewusers'});
})

router.get('/viewusers-getfollowers',async function (req,res) {
  var userId = req.query.userid;
  var response = {message:'',body:[]};
  try {
    response = await UserProfileService.getFollowers(userId);
  } catch (e) {
    console.log(e);
  }
  res.send(response);
})

router.get('/viewusers-getfollowings',async function (req,res) {
  var userId = req.query.userid;
  var response = {message:'',body:[]};
  try {
    response = await UserProfileService.getFollowings(userId);
  } catch (e) {
    console.log(e);
  }
  res.send(response);
})

router.get('/viewusers-getlikes',async function (req,res) {
  console.log('ROUTE::get Likes called');
  var postid = req.query.postid;
  var response = {message:'',body:[]};
  try {
    response = await UserPostService.getLikes(postid);
  } catch (e) {
    response.message = "error";
    console.log(e);
  }
  console.log('ROUTE::get Likes end');
  res.send(response);
})

router.get('/viewusers-getDisLikes',async function (req,res) {
  var postid = req.query.postid;
  var response = {message:'',body:[]};
  try {
    response = await UserPostService.getDisLikes(postid);
  } catch (e) {
    console.log(e);
  }
  res.send(response);
})

router.get('/viewusers-getComments',async function (req,res) {
  var postid = req.query.postid;
  var response = {message:'',body:[]};
  try {
    response = await UserPostService.getComments(postid);
  } catch (e) {
    console.log(e);
  }
  res.send(response);
})

router.post('/viewusers-changeUserStatus',async function (req,res) {
  var userid = req.body.userid?base64decode(req.body.userid):'';
  var response = {message:'',body:[]};
  if(req.session.user && req.session.user.role === "ADMIN"){
    try {
      response = await UserProfileService.changeUserStatus(userid);
    } catch (e) {
      response.message = 'internal server error...';
      console.log(e);
    }
  }else{
    response.message = 'UnAuthorized action.Can\'t proceed';
  }
  res.send(response);
})

router.post('/viewusers-changeOfficialStatus',async function (req,res) {
  var userid = req.body.userid?base64decode(req.body.userid):'';
  var response = {message:'',body:[]};
  if(req.session.user && req.session.user.role === "ADMIN"){
    try {
      response = await UserProfileService.changeOfficialStatus(userid);
    } catch (e) {
      response.message = 'internal server error...';
      console.log(e);
    }
  }else{
    response.message = 'UnAuthorized action.Can\'t proceed';
  }
  res.send(response);
})

router.post('/viewusers-deletePost',async function (req,res) {
  var postid = req.body.postid;
  var response = {message:'',body:[]};
  if(req.session.user && req.session.user.role === "ADMIN"){
    try {
      response = await UserPostService.deletePost(postid,'ADMIN');
    } catch (e) {
      response.message = 'internal server error...';
      console.log(e);
    }
  }else{
    response.message = 'UnAuthorized action.Can\'t proceed';
  }
  //response.message = 'Action.Can\'t proceed,Feature under process';
  res.send(response);
})

module.exports = router;
