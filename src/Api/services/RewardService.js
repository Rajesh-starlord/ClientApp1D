const dbService = require('../services/dbService');
const UserService = require('./UserService');
const { v4: uuidv4 } = require('uuid');

const RewardService = {
  //getRewardDetails
  getRewardDetails:async (userId) =>{
    console.log('API::RewardService--->getRewardDetails called');
    let resp = {status:'',message:'',body:{}};
    const query = {
      text:"select * from getcalculatedreward($1)",
      values:[userId]
    }
    try{
      const result = await dbService.execute(query);
      if(typeof result === 'string'){
        resp.message = result;
        resp.status = 'failed';
      }else{
        const RewardHistory = await RewardService.getRewardHistory(userId);
        resp.message = 'success';
        resp.status = 'success';
        resp.body.RewardDetails = result?result[0]:'';
        resp.body.RewardHistory = RewardHistory?RewardHistory.body:'';
      }
    }catch(e){
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },

  //requestReward
  requestReward:async (userId,transactionMethod) =>{
    console.log('API::RewardService--->requestReward called');
    let resp = {status:'',message:'',body:[]};
    const result = await RewardService.getRewardDetails(userId);
    if(parseFloat(result.body.RewardDetails.minclaimamount) <= parseFloat(result.body.RewardDetails.availablereward)){
      var rewardid = uuidv4();
      var amount = parseFloat(result.body.RewardDetails.availablereward);
      var claimedlikes = result.body.RewardDetails.availablerewardlikes;
      let query = {
        text:"insert into reward (userid,rewardid,requestedamount,claimedlikes,transactionmethod) values($1,$2,$3,$4,$5)",
        values:[userId,rewardid,amount,claimedlikes,transactionMethod]
      }
      try{
        var promise = await dbService.executeUpdate(query);
        if(promise === 'success'){
          resp.message = 'reward request successfull';
          resp.status = promise;
        }else{
          resp.message = promise;
          resp.status = 'failed';
        }
      }catch(e){
        resp.message = 'exception occured';
        resp.status = 'failed';
        console.log(e);
      }
    }else {
      resp.message = 'Minimum Withdrawable Amount is'+result.body.RewardDetails.minclaimamount;
      resp.status = 'failed';
    }
    return resp;
  },

  //getRewardHistory
  getRewardHistory:async (userId) =>{
    console.log('API::RewardService--->getRewardHistory called');
    let resp = {status:'',message:'',body:[]};
    var  query = {};
    if(userId){
      query = {
        text:"select * from reward where userid = $1",
        values:[userId]
      }
    }else {
      query = {
        text:"select * from reward",
        values:[]
      }
    }
    try{
      const promise = await dbService.execute(query);
      if(typeof promise === 'string'){
        resp.message = promise;
        resp.status = 'failed';
      }else{
        resp.message = 'success';
        resp.status = 'success';
        resp.body = promise;
      }
    }catch(e){
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },

  //approveReward
  approveReward:async (rewardDetails) =>{
    console.log('API::RewardService--->approveReward called');
    let resp = {status:'',message:'',body:[]};
    const query = {
      text:"update reward set status = 1,updatedby = $2,transactionid = $3,claimedon= now(),amountclaimed=$4 where rewardid = $1",
      values:[rewardDetails.rewardid,rewardDetails.adminId,rewardDetails.trxid,rewardDetails.claimedamount]
    }
    try{
      var promise = await dbService.executeUpdate(query);
      if(promise === 'success'){
        resp.message = promise;
        resp.status = 'success';
      }else{
        resp.message = promise;
        resp.status = 'failed';
        resp.body = promise;
      }
    }catch(e){
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  }
}

module.exports = RewardService;
