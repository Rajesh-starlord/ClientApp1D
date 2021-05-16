var express = require('express');
const router = new express.Router();
const {Client} = require('pg');
const db = require('../../src/Utils/dbConfig');
const errorLogger = require('../../src/Utils/dbError');
const dbService = require('../../src/services/dbService');
const crypto = require('crypto');
var axios = require("axios").default;
const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex');
const AuthService = require('../../src/services/AuthService');
const UserService = require('../../src/services/UserService');
const UserController = require('../../src/Controllers/UserController');
const {userModel} = require('../../src/Models/Models');

/*validate LOGIN page*/
router.post('/login', async function(req, res, next) {

  var userId = req.body.UserID;
  var password = req.body.Password;
  var client = new Client(db);
  var captcha = req.body.captcha;
  var ip =  req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null);
  req.session.ip = ip;

  var loginstatus = "";

  let decodepassword = AuthService.decodePassword(password);
  password = sha256(decodepassword);
  try{
      client.connect();
    }catch(e){
      res.send('Error while connecting to database');
    }
    const query = {
      text: 'select * from admindetail where userid =$1 and password = $2',
      values: [userId, password],
      rowAsArray: true
    }
    try{
       client.query(query, async (err, resp) => {
        if(err){
            errorLogger(err,query)
            loginstatus = "login failed";
            res.send({url:"/",message:"login failed"});
        }else if(resp){
          if(resp.rowCount == 0){
            loginstatus = "login failed";
            res.send({url:"/",message:"No User Found"});
          }else{
            //console.log(resp.rows[0]);
            let user = {};
            req.session.user = {};
            user.userId = resp.rows[0].userid;
            user.userName = resp.rows[0].userid;
            user.userType = resp.rows[0].role;
            user.role = resp.rows[0].role;
            user.divisionName = resp.rows[0].divisionname;

            const query1 = {
                text: 'select * from tbl_userrole_assgn where "role" = $1::text',
                values: [resp.rows[0].role],
                rowAsArray: true
            }
            var data = await dbService.execute(query1);
            var indexUrl = data[0].indexUrl;
            user.indexUrl = data[0].indexUrl;
            user.authorizedURL = await AuthService.getAuthorizedURL(data[0].functions);
            user.authorizedURL.push(user.indexUrl);
            loginstatus = "login success";
            req.session.user = user;
            res.send({url:indexUrl,message:"success"});
          }
        }
        await client.end();
      })
    }catch(e){
      res.status(500).send();
    }
});

/************ get nav data ***************/
router.post('/getNavData',async function(req, res, next) {
  let role =  req.session.user.role;
	var data = await AuthService.getNavBarData(role);
  res.send(data);
});


/************ forgot password***************/
router.get('/forgotpassword', function(req, res, next) {
  res.render('forgotpassword');
});

/********************** ADmin Changepwd *****************************************/
router.post('/changepassword',async function(req, res, next) {
  let status = '';
  req.body.userId = req.session.user.userId;
  if(req.body.Password == req.body.ConfPWD){
    status = await UserController.changePassword(req.body);
  }else{
    status = 'confirm password mismatch'
  }
  req.session.sessionFlash = status;
  res.redirect('back');
});

/************ logout ***************/
router.get('/logout',async function(req, res, next) {
  req.session.destroy();
  res.redirect('/');
});

/********* ACCESS DENIED **********/
router.get('/access-denied',function(req,res){
  console.log('Access-Denied to ::::'+req.session.user.userId)
  res.render('access-denied');
})


/************ GET CAPTCHA *****************/
router.get('/getCaptcha', function(req, res, next) {
    var cap = AuthService.getCaptcha();
    req.session.captcha = cap;
    res.locals.captcha = cap;
    res.send({captcha:cap});
});

module.exports = router;
