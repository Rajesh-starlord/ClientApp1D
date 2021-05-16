const nodemailer = require('nodemailer');
require('dotenv').config();

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
    }

}

module.exports = MailService;