const nodemailer = require('nodemailer');
require('dotenv').config();
const request = require('request');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.HostMail,
    pass: process.env.HostMailPass
  }
});

const MailService = {
    sendMail: (mailOptions) => {
        return new Promise((resolve,reject) => {
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  //console.log(error);
                  reject({response:error.response,status:0});
                } else {
                  console.log('Email sent: ' + info.response);
                  resolve({response:info.response,status:1});
                }
            });
        });
    },

    sendsmsOTP:(otp,mobile)=>{
      var URL = {
        method: 'GET',
        url: process.env.SMS_URL,
        qs:
        {
          authkey: process.env.SMS_AUTH_KEY,
          mobile: mobile,
          country_code: '91',
          sid: process.env.SID,
          otp:otp,
        },
      };
      return new Promise((resolve,reject) => {
        request(URL, function (error, response, body) {
          if (error) reject({code:0,msg:error});
          if(body){
            resolve(JSON.parse(body));
          }
        });
      });
    }

}

module.exports = MailService;