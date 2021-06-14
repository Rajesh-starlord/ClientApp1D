var dbService = require('../services/dbService');
const UserPostService = require('../services/UserPostService');

const UserPostController = {
  //save user Post
  savePost:async (userPostData) =>{
    console.log('API::UserPostController--->savePost called');
    var response = {status:'',message:'',body:[]};
    try{
      response = await UserPostService.savePost(userPostData);
    } catch (e) {
      response.status = 'failed';
      response.message = 'exception occured';
      console.log(e);
    }
    return response;
  },
  //get all posts
  getAllPosts:async (userid,start) =>{
    console.log('API::UserPostController--->getAllPosts called');
    var response = {status:'',message:'',body:[]};
    try{
      response = await UserPostService.getAllPosts(userid,start);
    } catch (e) {
      response.message = 'exception occured';
      console.log(e);
    }
    return response;
  },
  //fetch activity master
  getActivities:async ()=>{
    console.log('API::UserPostController--->getActivities called');
    let resp = {status:'',message:'',body:[]};
    try{
      resp= await UserPostService.getActivities();
    }catch(e){
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },
  //add like to user Post
  addLike:async (postId,likedBy) =>{
    console.log('API::UserPostController--->addLike called');
    var response = {status:'',message:'',body:[]};
    try{
      response = await UserPostService.addLike(postId,likedBy);
    } catch (e) {
      response.status = 'failed';
      response.message = 'exception occured';
      console.log(e);
    }
    return response;
  },
  //remove like from user Post
  removeLike:async (postId,likeRemovedBy) =>{
    console.log('API::UserPostController--->removeLike called');
    var response = {status:'',message:'',body:[]};
    try{
      response = await UserPostService.removeLike(postId,likeRemovedBy);
    } catch (e) {
      response.status = 'failed';
      response.message = 'exception occured';
      console.log(e);
    }
    return response;
  },
  //add dislike to user Post
  addDisLike:async (postId,dislikedBy) =>{
    console.log('API::UserPostController--->addDisLike called');
    var response = {status:'',message:'',body:[]};
    try{
      response = await UserPostService.addDisLike(postId,dislikedBy);
    } catch (e) {
      response.status = 'failed';
      response.message = 'exception occured';
      console.log(e);
    }
    return response;
  },
  //remove dislike from user Post
  removeDisLike:async (postId,dislikeRemovedBy) =>{
    console.log('API::UserPostController--->removeDisLike called');
    var response = {status:'',message:'',body:[]};
    try{
      response = await UserPostService.removeDisLike(postId,dislikeRemovedBy);
    } catch (e) {
      response.status = 'failed';
      response.message = 'exception occured';
      console.log(e);
    }
    return response;
  }
}

module.exports = UserPostController;
