var express = require('express');
var router = express.Router();
const RewardService = require('../../src/Api/services/RewardService');

router.post('/requestReward',async function(req, res, next){
  console.log('API:::requestReward called...');
  var response = {message:'',body:[]};
  var rewardDetails = req.body;
  if(rewardDetails.userId && rewardDetails.transactionMethod){
    try {
      response = await RewardService.requestReward(rewardDetails.userId,rewardDetails.transactionMethod);
    } catch (e) {
      response.message = 'internal server error';
      response.status = 'failed';
      console.log(e);
    }
  }else {
    response.status = 'failed';
    response.message = 'insufficient data provided';
  }
  res.send(response);
})

router.post('/getRewardDetails',async function(req, res, next){
  console.log('API:::requestReward called...');
  var response = {message:'',body:[]};
  var userId = req.body.userId;
  if(userId){
    try {
      response = await RewardService.getRewardDetails(userId);
    } catch (e) {
      response.message = 'internal server error';
      response.status = 'failed';
      console.log(e);
    }
  }else {
    response.status = 'failed';
    response.message = 'insufficient data provided';
  }
  res.send(response);
})

module.exports = router;
