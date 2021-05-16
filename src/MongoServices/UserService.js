var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://starlord:starlord@cluster0.9o3kx.mongodb.net/";

const UserService = {
  AuthenticateUser: async (id,password)=>{
    console.log("UserService.......AuthenticateUser..called");
      var response = {message:'',status:'',body:[]};
      await  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("myApp");
    //  var user = { name: "Company Inc", address: "Highway 37" };
      dbo.collection("users").find({userid:id,password:password}).toArray(function(err, res) {
        if (err) throw err;
      //  console.log(res);
        if(res.length > 0){
          response.message = 'success';
          response.status = true;
        }else{
          response.message = 'failed';
          response.status = false;
        }
        db.close();
      });
    });
    return response.status;
  },//end fun

  //createUser
  createUser:async (user)=>{
      MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("myApp");
      var user = {
            username: user.username,
            userid:user.userid,
            password:user.password,
            email:user.email,
            phone:user.phone,
            status:'Active'
      };
      dbo.collection("users").insertOne(user, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        console.log(res);
        db.close();
        return {message:'success',status:'success'};
      });
    });
  }//end fun
}

module.exports = UserService;
