const jwt = require('jsonwebtoken');
require('dotenv').config();

const getToken = function () {
  let jwtSecretKey = process.env.APP_SECRET;
    let data = {
        time: Date(),
        userId: 12,
    }
    const token = jwt.sign(data, jwtSecretKey);
    return token;
}

const Authenticate = function (req,res,next) {
    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    let jwtSecretKey = process.env.APP_SECRET;
    try {
        const token = req.header(tokenHeaderKey);
        const verified = jwt.verify(token, jwtSecretKey);
        if(verified){
          next();
        }else{
            // Access Denied
            return res.status(401).send(error);
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }
}

module.exports = { Authenticate, getToken };
