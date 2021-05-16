var express = require('express');
var router = express.Router();
const dbService = require('../../src/services/dbService');
const RewardService = require('../../src/Api/services/RewardService');
const { base64encode, base64decode } = require('nodejs-base64');


router.get('/rewardDetails',async function(req, res, next){
  let result = await dbService.execute('select minclaimamount,rewardfactor from rewardinfo');
  var minclaimamount = result?result[0].minclaimamount:0;
  var rewardfactor = result?result[0].rewardfactor:0;
  res.render('admin/rewardDetails',{minclaimamount,rewardfactor});
})

router.get('/rewardDetails-throughAjax',async function (req,res) {

  let param1 = req.query.param1;
  let draw = req.query.draw;
  let start = req.query.start;
  let length = req.query.length;
  let sql1 = 'select count(*) as count from reward';
  if(param1!=null && param1!=''){
    sql1+=' where status = '+param1;
  }
  const query1 = {
    text: sql1,
    values:[]
  }
  var result = await dbService.execute(query1);
  var total =result[0].count;

  let sql = 'select * from reward';
  if(param1!=null && param1!=''){
    sql += ' where status = '+param1;
  }
  sql += ' offset $1::integer limit $2::integer';
  const query = {
    text: sql,
    values:[start,length],
    rowAsArray: true
  }

  var data = await dbService.execute(query);
      data.forEach((item,i) => {
        item.userid = '&nbsp&nbsp;<a href="/admin/viewusers-profile?userid=\''+base64encode(item.userid)+'\'&&returnUrl=\'reward\'">'+item.userid+'</a>';
        if(parseInt(item.status) === 1 ){
          item.status = 'Approved';
          item.action = '';
        }else{
          item.status = 'Pending';
          item.action = '&nbsp&nbsp;<button class="btn btn-success" onclick=approveReward(\''+base64encode(item.rewardid)+'\','+parseFloat(item.requestedamount)+')>APPROVE</button>';
        }
      });
      contents = {data:data}
      contents.recordsTotal = total;
      contents.recordsFiltered = total;
      contents.draw = parseInt(draw);
      res.send(contents);
})

router.post('/rewardDetails-approve',async(req, res, next)=>{
  var response = {message:'',body:[]};
  var rewardDetails = req.body;
  rewardDetails.rewardid = rewardDetails.rewardid?base64decode(rewardDetails.rewardid):'';
  rewardDetails.adminId = req.session.user.userId;
  try {
    response = await RewardService.approveReward(rewardDetails);
  } catch (e) {
    response.message = 'internal server error';
    console.log(e);
  }
  res.send(response);
})

router.post('/rewardDetails-updateminclaimamount',async(req, res, next)=>{
  var response = {message:'success',body:[]};
  var minClaimAmount = req.body.minClaimAmount;
  if(minClaimAmount){
    try {
      response.message = await dbService.executeUpdate('update rewardinfo set minclaimamount ='+parseFloat(minClaimAmount));
      if(response.message == 'success'){
        let result = await dbService.execute('select minclaimamount,rewardfactor from rewardinfo');
        response.body = result[0];
      }
    } catch (e) {
      response.message = 'internal server error';
      console.log(e);
    }
  }
  res.send(response);
})

router.post('/rewardDetails-updaterewardfactor',async(req, res, next)=>{
  var response = {message:'success',body:[]};
  var rewardFactor = req.body.rewardFactor;
  if(rewardFactor){
    try {
      response.message = await dbService.executeUpdate('update rewardinfo set rewardfactor ='+parseFloat(rewardFactor));
      if(response.message == 'success'){
        let result = await dbService.execute('select minclaimamount,rewardfactor from rewardinfo');
        response.body = result[0];
      }
    } catch (e) {
      response.message = 'internal server error';
      console.log(e);
    }
  }
  res.send(response);
})

module.exports = router;
