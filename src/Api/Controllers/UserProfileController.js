const UserProfileService = require('../services/UserProfileService');
const UserService = require('../services/UserService');
const UserProfileController = {
  //save user Post
  saveUserProfile:async (userProfileData) =>{
    console.log('API::UserProfileController--->saveUserProfile called');
    var response = {status:'',message:'',body:[]};
    try{
      response = await UserProfileService.saveUserProfile(userProfileData);
    } catch (e) {
      response.status = 'failed';
      response.message = 'exception occured';
      console.log(e);
    }
    return response;
  },

  //update user profile
  updateProfileDetails:async (userProfileData) =>{
    console.log('API::UserProfileController--->updateProfileDetails called');
    var response = {status:'',message:'',body:[]};
    try{
      let userchk = '';
      if(userProfileData.userId != userProfileData.newUserId){
          userchk = await UserService.isUserExists(userProfileData.newUserId);
      }
      if(!userchk.status){
        /*let mobileChk = await UserService.chkDuplicateMobileNo(userProfileData.mobile);
        if(!mobileChk.status || mobileChk.body.userid == userProfileData.userId){
          let emailChk = await UserService.chkDuplicateEmail(userProfileData.email);
          if(!emailChk.status || emailChk.body.userid == userProfileData.userId){*/
            response = await UserProfileService.updateProfileDetails(userProfileData);
          /*}else {
            response.message = 'Email Already Exists';
          }
        }else{
          response.message = 'Mobile no Already Exists';
        }*/
      }else {
        response.message = 'UserID Already Exists';
      }
    } catch (e) {
      response.status = 'failed';
      response.message = 'exception occured';
      console.log(e);
    }
    return response;
  },

  //getUsers
  getAllUsers:async (userId) =>{
    console.log('API::UserProfileController--->getAllUsers called');
    var response = {status:'',message:'',body:[]};
    try{
      response = await UserProfileService.getAllUsers(userId);
    } catch (e) {
      response.status = 'failed';
      response.message = 'exception occured';
      console.log(e);
    }
    return response;
  },

  //add following
  addFollowing:async (userId,toFollow) =>{
    console.log('API::UserProfileController--->addFollowing called');
    var response = {status:'',message:'',body:[]};
    try{
      response = await UserProfileService.updateFollowingList(userId,toFollow);
      if(response.message == 'success'){
        let targetUser = toFollow;
        let follwedBy = userId;
        let result = response.body;
        response = await UserProfileService.updateFollowersList(targetUser,follwedBy);
        response.body  = result;
        return response;
      }else{
        response.status = 'failed';
        return response;
      }
    } catch (e) {
      response.status = 'failed';
      response.message = 'exception occured';
      return response;
      console.log(e);
    }
  },
  //add following
  unfollowUser:async (userId,toUnFollow) =>{
    console.log('API::UserProfileController--->addFollowing called');
    var response = {status:'',message:'',body:[]};
    try{
      response = await UserProfileService.removeFromFollowingList(userId,toUnFollow);
      if(response.message == 'success'){
        let targetUser = toUnFollow;
        let follwedBy = userId;
        let result = response.body;
        response = await UserProfileService.removeFromFollowersList(targetUser,follwedBy);
        response.body  = result;
      }else{
        response.status = 'failed';
      }
    } catch (e) {
      response.status = 'failed';
      response.message = 'exception occured';
      console.log(e);
    }
    return response;
  }
}

module.exports = UserProfileController;
