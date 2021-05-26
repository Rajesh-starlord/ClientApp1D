var dbService = require('../services/dbService');
const { v4: uuidv4 } = require('uuid');

const UserPostService = {
  //save user Post
  savePost:async (userPostData) =>{
    console.log('API::UserPostService--->savePost called');
    let resp = {status:'',message:'',body:[]};
    let postid = 'POST-'+uuidv4();
    const query = {
      text:" select * from  createUserPost($1,$2,$3,$4,$5,$6,$7,$8)",
      values:[postid,userPostData.postTitle,userPostData.postDesc,userPostData.fileName,userPostData.filePath,
        userPostData.postedBy,parseInt(userPostData.activity),parseInt(userPostData.postType)]
    }
    try{
      var result = await dbService.execute(query);
      if(typeof result == 'string'){
        resp.message = resp;
        resp.status = 'failed';
      }else{
        resp.message = 'posted successfully';
        resp.status = 'success';
        resp.body = result;
      }
    }catch(e){
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },

  //fetch activity master
  getActivities:async ()=>{
    console.log('API::UserPostService--->getActivities called');
    let resp = {status:'',message:'',body:[]};
    const query = {
      text:" select * from activity",
      values:[]
    }
    try{
      var result = await dbService.execute(query);
      if(typeof result == 'string'){
        resp.message = resp;
        resp.status = 'failed';
      }else{
        resp.message = 'success';
        resp.status = 'success';
        resp.body = result;
      }
    }catch(e){
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },

  //fetch all posts
  getAllPosts:async (userid) =>{
    console.log('API::UserPostService--->getAllPosts called');
    let resp = {status:'',message:'',body:[]};
    const query = {
      text:" select * from fetchAllPosts($1)",
      values:[userid]
    }
    try{
      var result = await dbService.execute(query);
      if(typeof result == 'string'){
        resp.message = resp;
      }else{
        const posts = await UserPostService.filterPostsByFollow(result,userid);
        if(posts && typeof posts !== 'string'){
          posts.forEach((item, i) => {
            if(item.likedby){
              var arr = item.likedby.split(',');
              if(arr.includes(userid)){
                item.isLikedbyMe = true;
              }else{
                item.isLikedbyMe = false;
              }
            }else{
              item.isLikedbyMe = false;
            }
            if(item.dislikedby){
              var arr = item.dislikedby.split(',');
              if(arr.includes(userid)){
                item.isdisLikedbyMe = true;
              }else{
                item.isdisLikedbyMe = false;
              }
            }else{
              item.isdisLikedbyMe = false;
            }
          });
          resp.body = posts;
        }
      }
    }catch(e){
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },

  //filter posts by followers and following
  filterPostsByFollow:async (result,userid) =>{
    console.log('API::UserPostService--->filterPostsByFollow called');
    var newresult = [];
    const query = {
      text:"select following,followers from userdetail where userid = $1",
      values:[userid]
    }
    try{
      let resp = await dbService.execute(query);
      if(typeof resp !== 'string'){
        // let followers = (resp.length > 0 && resp[0].followers && resp[0].followers.length > 0) ? resp[0].followers.split(',') : '';
        let following = (resp.length > 0 && resp[0].following && resp[0].following.length > 0) ? resp[0].following.split(',') : '';
        // r => followers.includes(r.postedby) || 
        newresult = result.filter(following.includes(r.postedby) || r.postedby === 'Admin01' || r.postedby === userid);
      }
    }catch(e){
      newresult  = 'exception occured';
      console.log(e);
    }
    return newresult;
  },

  //fetch all posts
  getPostsOfUser:async (userid) =>{
    console.log('API::UserPostService--->getPostsOfUser called');
    var result = [];
    const query = {
      text:"select p.postid,p.posttitle,p.postdesc,p.filename,p.filepath,p.postedby,p.likes,p.dislikes,p.likedby,p.dislikedby,p.postedon,p.status,p.posttype,(select a.activity from activity as a where a.serialno = p.activity) as activity,p.comments  from  userposts as p where postedBy = $1 and deletedflag = 0",
      values:[userid]
    }
    try{
      result = await dbService.execute(query);
    }catch(e){
      result = 'exception occured';
      console.log(e);
    }
    if(result && result !== 'string' && result.length > 0){
      result.forEach(r=>{
        r.activity = r.activity && r.activity === 'Default'?null:r.activity;
      });
    }
    return result;
  },

  //add like to user Post
  addLike:async (postId,likedBy) =>{
    console.log('API::UserPostService--->addLike called');
    let resp = {status:'',message:'',body:[]};
    var userList = likedBy;
    const promise = await UserPostService.removeDisLike(postId,likedBy);
    if(promise.message === 'success'){
      const query = {
        text:"select likes,likedby from userposts where postId = $1",
        values:[postId]
      }
      try{
        const result = await dbService.execute(query);
        if(typeof result == 'string'){
          resp.message = resp;
          resp.status = 'failed';
        }else{
          if(result.length > 0){
            var post = result[0];
            var totalLikes = parseInt(post.likes);
            var arr = [];
            if(totalLikes > 0){
              arr = post.likedby.split(',');
              if(!arr.includes(likedBy)){
                userList = post.likedby+','+userList;
                totalLikes += 1;
              }
            }else {
              totalLikes += 1;
            }
            if(!arr.includes(likedBy) || arr.length == 0){
              const query1 = {
                text:"update userposts set likes = $1,likedBy = $2 where postid = $3",
                values:[totalLikes,userList,postId]
              }
              resp.message = await dbService.executeUpdate(query1);
            }else{
              resp.message = 'success';
            }
            if(resp.message = 'success'){
              resp.body = {likeCount:totalLikes,dislikeCount:promise.body.dislikeCount};
            }
          }
        }
      }catch(e){
        resp.message = 'exception occured';
        resp.status = 'failed';
        console.log(e);
      }
    }
    return resp;
  },

  //remove like from user Post
  removeLike:async (postId,likeRemovedBy) =>{
    console.log('API::UserPostService--->removeLike called');
    let resp = {status:'',message:'',body:[]};
    var userList = '';
    const query = {
      text:"select likes,likedby from userposts where postId = $1",
      values:[postId]
    }
    try{
      const result = await dbService.execute(query);
      if(typeof result == 'string'){
        resp.message = resp;
        resp.status = 'failed';
      }else{
        if(result.length > 0){
          var post = result[0];
          var totalLikes = parseInt(post.likes);
          var array = [];
          if(totalLikes > 0){
            array = post.likedby.split(',');
            if(array.includes(likeRemovedBy)){
              array = array.filter(arr => arr !== likeRemovedBy);
              array.forEach((item, i) => {
                userList+=item+',';
              });
              userList = userList.slice(0,userList.length-1);
              totalLikes -= 1;
              const query1 = {
                text:"update userposts set likes = $1,likedBy =$2 where postid = $3",
                values:[totalLikes,userList,postId]
              }
              resp.message = await dbService.executeUpdate(query1);
            }else{
              resp.message = 'success';
            }
          }else{
            resp.message = 'success';
          }
          if(resp.message = 'success'){
            resp.body = {likeCount:totalLikes};
          }
        }
      }
    }catch(e){
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },
  
  //add dislike to user Post
  addDisLike:async (postId,dislikedBy) =>{
    console.log('API::UserPostService--->addDisLike called');
    let resp = {status:'',message:'',body:[]};
    var userList = dislikedBy;
    const promise = await UserPostService.removeLike(postId,dislikedBy);
    if(promise.message === 'success'){
      const query = {
        text:"select dislikes,dislikedby from userposts where postId = $1",
        values:[postId]
      }
      try{
        const result = await dbService.execute(query);
        if(typeof result == 'string'){
          resp.message = resp;
          resp.status = 'failed';
        }else{
          if(result.length > 0){
            var post = result[0];
            var totalDisLikes = parseInt(post.dislikes);
            var arr = [];
            if(totalDisLikes > 0){
              arr = post.dislikedby.split(',');
              if(!arr.includes(dislikedBy)){
                userList = post.dislikedby+','+userList;
                totalDisLikes +=1;
              }
            }else {
              totalDisLikes +=1;
            }
            if(!arr.includes(dislikedBy) || arr.length == 0){
              const query1 = {
                text:"update userposts set dislikes = $1,dislikedBy =$2 where postid = $3",
                values:[totalDisLikes,userList,postId]
              }
              resp.message = await dbService.executeUpdate(query1);
            }else {
              resp.message = 'success';
            }
            if(resp.message = 'success'){
              resp.body = {likeCount:promise.body.likeCount,dislikeCount:totalDisLikes};
            }
          }
        }
      }catch(e){
        resp.message = 'exception occured';
        resp.status = 'failed';
        console.log(e);
      }
    }
    return resp;
  },
  //remove dislike from user Post
  removeDisLike:async (postId,dislikeRemovedBy) =>{
    console.log('API::UserPostService--->removeDisLike called');
    let resp = {status:'',message:'',body:[]};
    var userList = '';
    const query = {
      text:"select dislikes,dislikedby from userposts where postId = $1",
      values:[postId]
    }
    try{
      const result = await dbService.execute(query);
      if(typeof result == 'string'){
        resp.message = resp;
        resp.status = 'failed';
      }else{
        if(result.length > 0){
          var post = result[0];
          var totalDisLikes = parseInt(post.dislikes);
          if(totalDisLikes > 0){
            let array = post.dislikedby.split(',');
            if(array.includes(dislikeRemovedBy)){
              array = array.filter(arr => arr !== dislikeRemovedBy);
              array.forEach((item, i) => {
                userList+=item+',';
              });
              userList = userList.slice(0,userList.length-1);
              totalDisLikes -= 1
              const query1 = {
                text:"update userposts set dislikes = $1,dislikedBy =$2 where postid = $3",
                values:[totalDisLikes,userList,postId]
              }
              resp.message = await dbService.executeUpdate(query1);
            }else {
                resp.message = 'success';
            }
          } else {
            resp.message = 'success';
          }
          if(resp.message = 'success'){
            resp.body = {dislikeCount:totalDisLikes};
          }
        }
      }
    }catch(e){
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },

  addComment:async (postId,comment,commentBy)=>{
    console.log('UserPostService--->addComment called...');
    var response  = {message:'',status:'',body:[]};
    try {
      let query = {
        text:'select * from addcomment($1,$2,$3)',
        values:[postId,comment,commentBy]
      }
      let result = await dbService.execute(query);
      if(typeof result == 'string'){
        response.message = result;
        response.status = 'failed';
      }else {
        response.message = "success";
        response.status = 'success';
        response.body  = {totalComments:result[0].comments};
      }
    } catch (e) {
      console.log(e);
      response.message = "error";
      response.status = 'failed';
    } finally {
      if(response.message == 'success'){
        response.status = 'success';
      }else{
        response.message = "error";
        response.status = 'failed';
      }
    }
    return response;
  },

  getComments:async (postId) => {
    console.log('UserService--->getComments called')
    var resp = {status:'',message:'',body:[]};
    if(postId){
      let query = {
        text:"select postid,comment,commentBy,commentedon,(select userName from userdetail where userid = commentBy) as commentByName,(select profileimg from userdetail where userid = commentBy) from usercomments where postid = $1",
        values:[postId]
      }
      try{
        let result = await dbService.execute(query);
        if(typeof result == 'string'){
          resp.message = result;
          resp.status = 'failed';
        }else{
          resp.message = 'success';
          resp.status = 'success';
          resp.body = result;
        }
      }catch(e){
        resp.message = 'exception occured';
        resp.status = 'failed';
        console.log(e);
      }
    }
    return resp;
  },

  getLikes:async (postId)=>{
    console.log('UserService--->getLikes called');
    var resp = {status:'',message:'',body:[]};
    if(postId){
      let query = {
        text:"select likedBy from userposts where postid = $1",
        values:[postId]
      }
      try{
        let result = await dbService.execute(query);
        if(typeof result == 'string'){
          resp.message = result;
          resp.status = 'failed';
        }else{
          if(result.length > 0){
            let likedBy = result[0].likedby.split(',');
            let text = "select userid,username,profileimg  from userdetail where userid in (";
            likedBy.forEach((str, i) => {
              text+='\''+str+'\',';
            });
            text = text.substring(0,text.length-1)+')';
            let sql = {
              text:text,
              values:[]
            }
            let result1 = await dbService.execute(sql);
            console.log(result1);
            if(typeof result1 == 'string'){
              resp.message = result1;
              resp.status = 'failed';
            }else{
              resp.message = 'success';
              resp.status = 'success';
              resp.body = result1;
            }
          }
        }
      }catch(e){
        resp.message = 'exception occured';
        resp.status = 'failed';
        console.log(e);
      }
    }
    return resp;
  },

  getDisLikes:async (postId)=>{
    console.log('UserService--->getDisLikes called');
    var resp = {status:'',message:'',body:[]};
    if(postId){
      let query = {
        text:"select dislikedBy from userposts where postid = $1",
        values:[postId]
      }
      try{
        let result = await dbService.execute(query);
        if(typeof result == 'string'){
          resp.message = result;
          resp.status = 'failed';
        }else{
          if(result.length > 0){
            let dislikedBy = result[0].dislikedby.split(',');
            let text = "select userid,username,profileimg  from userdetail where userid in (";
            dislikedBy.forEach((str, i) => {
              text+='\''+str+'\',';
            });
            text = text.substring(0,text.length-1)+')';
            let sql = {
              text:text,
              values:[]
            }
            let result1 = await dbService.execute(sql);
            if(typeof result1 == 'string'){
              resp.message = result1;
              resp.status = 'failed';
            }else{
              resp.message = 'success';
              resp.status = 'success';
              resp.body = result1;
            }
          }
        }
      }catch(e){
        resp.message = 'exception occured';
        resp.status = 'failed';
        console.log(e);
      }
    }
    return resp;
  },

  //deletePost
  deletePost:async (postid,userid) =>{
    console.log('API::UserPostService--->savePost called');
    let resp = {status:'',message:'',body:[]};
    const query = {
      text:" select * from  deletePost($1,$2)",
      values:[postid,userid]
    }
    try{
      var result = await dbService.execute(query);
      if(typeof result == 'string'){
        resp.message = resp;
        resp.status = 'failed';
      }else{
        if(parseInt(result[0].status) === 1){
          resp.message = 'post deleted successfully';
          resp.status = 'success';
          resp.body = result;
        }else{
          resp.message = 'You can\'t perform this operation';
          resp.status = 'failed';
        }
      }
    }catch(e){
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  }

}

module.exports = UserPostService;
