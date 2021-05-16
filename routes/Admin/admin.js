var express = require('express');
const router = express.Router();
const UserController = require('../../src/Controllers/UserController');
const DashboardService = require('../../src/services/DashboardService');


/************ dashboard ***************/
router.get('/index', async function(req, res, next) {
  var DashData = {};
  try {
    DashData = await DashboardService.getDashData();
  } catch (error) {
    console.log(error);
  }
  res.render('admin/index',{DashData:DashData});
});

/************ forgot password***************/
router.get('/forgotpassword', function(req, res, next) {
  res.render('forgotpassword');
});
/*****************************/

/********************** ADmin Changepwd *****************************************/
router.get('/changepassword', function(req, res, next) {
  res.render('admin/changepassword');
});

/********************** ADmin Changepwd *****************************************/
router.post('/changepassword',async function(req, res, next) {
  let status = '';
  req.body.userId = req.session.user.userId;
  console.log(req.body);
  if(req.body.Password == req.body.ConfPWD){
    status = await UserController.changePassword(req.body);
  }else{
    status = 'confirm password mismatch'
  }
  req.session.sessionFlash = status;
  res.redirect('back');
});

module.exports = router;
