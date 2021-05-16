class userModel {
  constructor(userId,userName,password,cnfPassword,email,mobile,dob,gender,state,city){
    this.userId = userId;
    this.userName = userName;
    this.password = password;
    this.cnfPassword = cnfPassword;
    this.email = email;
    this.mobile = mobile;
    this.dob = dob;
    this.age = dob?this.getAge(dob):0;
    this.gender = gender;
    this.state = state;
    this.city = city;
    this.status = 'Active';
  }
  getAge(dob){
    if(dob){
      var date  = new Date();
      var currentyear = date.getFullYear();
      var yearOfBirth = dob.split('/')[2];
      return parseInt(currentyear) - parseInt(yearOfBirth);
    }
  }
}

module.exports = {userModel};
