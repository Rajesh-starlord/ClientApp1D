const dbService = require('../services/dbService');
const UserService = require('./UserService');
const UserPostService = require('./UserPostService');

const UserProfileService = {
  //save user Post
  saveUserProfile: async (userProfileData) => {
    console.log('API::UserProfileService--->saveUserProfile called');
    let resp = { status: '', message: '', body: [] };
    let query = {
      text: "update userdetail set profileimg = $1 where userid = $2",
      values: [userProfileData.filePath, userProfileData.userId]
    }
    try {
      var result = await dbService.executeUpdate(query);
      if (result === 'success') {
        resp.message = result;
        resp.status = result;
      } else {
        resp.message = result;
        resp.status = 'failed';
        resp.body = result;
      }
    } catch (e) {
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },

  //updateProfileDetails
  updateProfileDetails: async (userProfileData) => {
    console.log('API::UserProfileService--->saveUserProfile called');
    let resp = { status: '', message: '', body: [] };
    let query = {
      text: "update userdetail set userid = $1,userName = $2 where userid = $3",
      values: [userProfileData.newUserId, userProfileData.userName, userProfileData.userId]
    }
    try {
      var result = await dbService.executeUpdate(query);
      if (result === 'success') {
        resp.message = result;
        resp.status = result;
      } else {
        resp.message = result;
        resp.status = 'failed';
        resp.body = result;
      }
    } catch (e) {
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },

  //getUserProfile
  getUserProfile: async (userId) => {
    console.log('API::UserProfileService--->getUserProfile called');
    let resp = { status: '', message: '', body: [] };
    let query = {
      text: "select *,(select count(*) from userposts where postedBy = $1 and deletedflag = 0) as totalposts,(select sum(likes) from userposts where postedBy = $1) as totalLikes,(select sum(dislikes) from userposts where postedBy = $1) as totalDisLikes from userdetail where userid = $1 and status = 'Active'",
      values: [userId]
    }
    try {
      var result = await dbService.execute(query);
      if (typeof result === 'string') {
        resp.message = result;
        resp.status = 'failed';
      } else {
        var userProfile = {};
        if (result.length > 0) {
          userProfile = result[0];
        }
        var posts = await UserPostService.getPostsOfUser(userId);
        userProfile.posts = posts.length > 0 ? posts.filter(p => p.posttype === 1) : [];
        resp.message = 'success';
        resp.status = 'success';
        resp.body = userProfile;
      }
    } catch (e) {
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },

  //get user data
  getAllUsers: async (userId) => {
    console.log('UserService--->getAllUsers called')
    var resp = { status: '', message: '', body: [] };
    if (userId && UserService.isUserExists(userId)) {
      let query = {
        text: "select * from userdetail where status = 'Active' and userid != $1 order by totalfollowers desc",
        values: [userId]
      }
      let result = [];
      try {
        result = await dbService.execute(query);
        if (typeof result == 'string') {
          resp.message = resp;
          resp.status = 'failed';
        } else {
          result.forEach((item, i) => {
            let followers = item.totalfollowers > 0 ? item.followers.split(',') : '';
            if (followers.includes(userId)) {
              item.isFollowing = true;
            } else {
              item.isFollowing = false;
            }
          });
          resp.message = result.length > 0 ? 'success' : 'no users found';
          resp.status = 'success';
          resp.body = result;
        }
      } catch (e) {
        resp.message = 'exception occured';
        resp.status = 'failed';
        console.log(e);
      }
    }
    return resp;
  },

  //get  searchPeople
  searchPeople: async (searchVal, userId) => {
    console.log('UserService--->searchPeople called')
    var resp = { status: '', message: '', body: [] };
    if (userId && UserService.isUserExists(userId)) {
      let query = {
        text: "select * from userdetail where status = 'Active' and UPPER(username) like $1",
        values: [searchVal.toUpperCase() + "%"]
      }
      let result = [];
      try {
        result = await dbService.execute(query);
        if (typeof result == 'string') {
          resp.message = resp;
          resp.status = 'failed';
        } else {
          result.forEach((item, i) => {
            let followers = item.totalfollowers > 0 ? item.followers.split(',') : '';
            if (followers.includes(userId)) {
              item.isFollowing = true;
            } else {
              item.isFollowing = false;
            }
          });
          resp.message = result.length > 0 ? 'success' : 'no users found';
          resp.status = 'success';
          resp.body = result;
        }
      } catch (e) {
        resp.message = 'exception occured';
        resp.status = 'failed';
        console.log(e);
      }
    }
    return resp;
  },

  //update following-list
  updateFollowingList: async (userId, toFollow) => {
    console.log('API::UserProfileService--->updateFollowingList called');
    let resp = { status: '', message: '', body: [] };
    var newfollwingList = toFollow;
    const query = {
      text: "select totalfollowing,following from userdetail where userid = $1",
      values: [userId]
    }
    try {
      const result = await dbService.execute(query);
      if (typeof result == 'string') {
        resp.message = result;
        resp.status = result;
      } else {
        if (result.length > 0) {
          var user = result[0];
          var totalfollowing = parseInt(user.totalfollowing);
          var followingList = [];
          if (totalfollowing > 0) {
            followingList = user.following.split(',');
            if (!followingList.includes(toFollow)) {
              newfollwingList = user.following + ',' + toFollow;
              totalfollowing += 1;
            }
          } else {
            totalfollowing += 1;
          }
          if (!followingList.includes(toFollow) || followingList.length == 0) {
            const query1 = {
              text: "update userdetail set totalfollowing = $1,following = $2 where userid = $3",
              values: [totalfollowing, newfollwingList, userId]
            }
            resp.message = await dbService.executeUpdate(query1);
          } else {
            resp.message = 'success';
          }
          if (resp.message == 'success') {
            resp.body = { totalfollowing: totalfollowing };
          }
        }
      }
    } catch (e) {
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },

  //update followers-list
  updateFollowersList: async (userId, follwedBy) => {
    console.log('API::UserProfileService--->updateFollowersList called');
    let resp = { status: '', message: '', body: [] };
    var newfollwersList = follwedBy;
    const query = {
      text: "select totalfollowers,followers from userdetail where userid = $1",
      values: [userId]
    }
    try {
      const result = await dbService.execute(query);
      if (typeof result == 'string') {
        resp.message = result;
        resp.status = result;
      } else {
        if (result.length > 0) {
          var user = result[0];
          var totalfollowers = parseInt(user.totalfollowers);
          var followersList = [];
          if (totalfollowers > 0) {
            followersList = user.followers.split(',');
            if (!followersList.includes(follwedBy)) {
              newfollwersList = user.followers + ',' + follwedBy;
              totalfollowers += 1;
            }
          } else {
            totalfollowers += 1;
          }
          if (!followersList.includes(follwedBy) || followersList.length == 0) {
            const query1 = {
              text: "update userdetail set totalfollowers = $1,followers = $2 where userid = $3",
              values: [totalfollowers, newfollwersList, userId]
            }
            let message = await dbService.executeUpdate(query1);
            resp.message = message;
          } else {
            resp.message = 'success';
          }
        }
      }
    } catch (e) {
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },

  //removeFromFollowingList
  removeFromFollowingList: async (userId, toUnFollow) => {
    console.log('API::UserProfileService--->removeFromFollowingList called');
    let resp = { status: '', message: '', body: [] };
    var newfollwingList = '';
    const query = {
      text: "select totalfollowing,following from userdetail where userid = $1",
      values: [userId]
    }
    try {
      const result = await dbService.execute(query);
      if (typeof result == 'string') {
        resp.message = result;
        resp.status = result;
      } else {
        if (result.length > 0) {
          var user = result[0];
          var totalfollowing = parseInt(user.totalfollowing);
          var followingList = [];
          if (totalfollowing > 0) {
            followingList = user.following.split(',');
            if (followingList.includes(toUnFollow)) {
              followingList = followingList.filter(id => id !== toUnFollow);
              followingList.forEach((item, i) => {
                newfollwingList += item + ',';
              });
              newfollwingList = newfollwingList ? newfollwingList.slice(0, newfollwingList.length - 1) : null;
              totalfollowing -= 1;
              const query1 = {
                text: "update userdetail set totalfollowing = $1,following = $2 where userid = $3",
                values: [totalfollowing, newfollwingList, userId]
              }
              resp.message = await dbService.executeUpdate(query1);
            } else {
              resp.message = 'success';
            }
          } else {
            resp.message = 'success';
          }
        }
        if (resp.message == 'success') {
          resp.body = { totalfollowing: totalfollowing };
        }
      }
    } catch (e) {
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },

  //removeFromFollowersList
  removeFromFollowersList: async (userId, follwedBy) => {
    console.log('API::UserProfileService--->removeFromFollowersList called');
    let resp = { status: '', message: '', body: [] };
    var newfollwersList = '';
    const query = {
      text: "select totalfollowers,followers from userdetail where userid = $1",
      values: [userId]
    }
    try {
      const result = await dbService.execute(query);
      if (typeof result == 'string') {
        resp.message = result;
        resp.status = result;
      } else {
        if (result.length > 0) {
          var user = result[0];
          var totalfollowers = parseInt(user.totalfollowers);
          var followersList = [];
          if (totalfollowers > 0) {
            followersList = user.followers.split(',');
            if (followersList.includes(follwedBy)) {
              followersList = followersList.filter(id => id !== follwedBy);
              followersList.forEach((item, i) => {
                newfollwersList += item + ',';
              });
              newfollwersList = newfollwersList ? newfollwersList.slice(0, newfollwersList.length - 1) : null;
              totalfollowers -= 1;
              const query1 = {
                text: "update userdetail set totalfollowers = $1,followers = $2 where userid = $3",
                values: [totalfollowers, newfollwersList, userId]
              }
              resp.message = await dbService.executeUpdate(query1);
            } else {
              resp.message = 'success';
            }
          } else {
            resp.message = 'success';
          }
        }
      }
    } catch (e) {
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },


  getFollowings: async (userId) => {
    console.log('UserProfileService--->getFollowings called');
    var resp = { status: '', message: '', body: [] };
    if (userId) {
      let query = {
        text: "select following from userdetail where userid = $1",
        values: [userId]
      }
      try {
        let result = await dbService.execute(query);
        if (typeof result == 'string') {
          resp.message = result;
          resp.status = 'failed';
        } else {
          if (result.length > 0 && result[0].following) {
            let following = result[0].following ? result[0].following.split(',') : '';
            let text = "select userid,username,profileimg  from userdetail where userid in (";
            following.forEach((str, i) => {
              text += '\'' + str + '\',';
            });
            text = text.substring(0, text.length - 1) + ')';
            let sql = {
              text: text,
              values: []
            }
            let result1 = await dbService.execute(sql);
            if (typeof result1 == 'string') {
              resp.message = result1;
              resp.status = 'failed';
            } else {
              resp.message = 'success';
              resp.status = 'success';
              resp.body = result1;
            }
          } else {
            resp.message = 'no followings';
            resp.status = 'success';
          }
        }
      } catch (e) {
        resp.message = 'exception occured';
        resp.status = 'failed';
        console.log(e);
      }
    }
    return resp;
  },

  getFollowers: async (userId) => {
    console.log('UserProfileService--->getFollowers called');
    var resp = { status: '', message: '', body: [] };
    if (userId) {
      let query = {
        text: "select followers from userdetail where userid = $1",
        values: [userId]
      }
      try {
        let result = await dbService.execute(query);
        if (typeof result == 'string') {
          resp.message = result;
          resp.status = 'failed';
        } else {
          console.log('inside else');
          if (result.length > 0 && result[0].followers) {
            let followers = result[0].followers ? result[0].followers.split(',') : '';
            let text = "select userid,username,profileimg  from userdetail where userid in (";
            followers.forEach((str, i) => {
              text += '\'' + str + '\',';
            });
            text = text.substring(0, text.length - 1) + ')';
            let sql = {
              text: text,
              values: []
            }
            let result1 = await dbService.execute(sql);
            if (typeof result1 == 'string') {
              resp.message = result1;
              resp.status = 'failed';
            } else {
              resp.message = 'success';
              resp.status = 'success';
              resp.body = result1;
            }
          } else {
            resp.message = 'no followers';
            resp.status = 'success';
          }
        }
      } catch (e) {
        resp.message = 'exception occured';
        resp.status = 'failed';
        console.log(e);
      }
    }
    return resp;
  },

  //changeUserStatus
  changeUserStatus: async (userid) => {
    console.log('API::UserProfileService--->changeUserStatus called');
    let resp = { status: '', message: '', body: [] };
    let query = {
      text: 'update userdetail set status = (case when (select status from userdetail where userid=$1) = \'Active\' then \'InActive\' else \'Active\' end) where userid=$1',
      values: [userid]
    }
    try {
      var result = await dbService.executeUpdate(query);
      if (result === 'success') {
        resp.message = result;
        resp.status = result;
      } else {
        resp.message = result;
        resp.status = 'failed';
        resp.body = result;
      }
    } catch (e) {
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  },

  //changeOfficialStatus
  changeOfficialStatus: async (userid) => {
    console.log('API::UserProfileService--->changeOfficialStatus called');
    let resp = { status: '', message: '', body: [] };
    let query = {
      text: 'update userdetail set IsOfficial = (case when (select IsOfficial from userdetail where userid=$1) = 1 then 0 else 1 end) where userid=$1',
      values: [userid]
    }
    try {
      var result = await dbService.executeUpdate(query);
      if (result === 'success') {
        resp.message = result;
        resp.status = result;
      } else {
        resp.message = result;
        resp.status = 'failed';
        resp.body = result;
      }
    } catch (e) {
      resp.message = 'exception occured';
      resp.status = 'failed';
      console.log(e);
    }
    return resp;
  }
}

module.exports = UserProfileService;
