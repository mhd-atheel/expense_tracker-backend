const nodemailer = require("nodemailer");


const sendOtp = async (email, otp) => {
    var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // or 587 for TLS
      secure: true, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    };
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        
      }
    });
  }; 
  
  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
}

module.exports =  {generateOTP,sendOtp}