const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {generateOTP,sendOtp} = require("../utils/sendOtp")


const signup = async (req, res) => {
  
  try {
    const { name, email, password } = req.body;

    const existEmail = await User.findOne({ email });

    if (existEmail) {
      res.status(400).json({ message: "Email Already Exist" });
      return;
    }
    
      // Generate OTP and set expiration time
    const otp = generateOTP();
    const otpExpires = Date.now() + 300000; // OTP expires in 5 minutes

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false
    });

    const user = await newUser.save();
    await sendOtp(email, otp);
    

    res.status(200).json(user);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

const login = async (req, res) => {
  const fiveDaysInMilliseconds = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
  const expirationDate = new Date(Date.now() + fiveDaysInMilliseconds);
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    const isValidPassword = await bcrypt.compare(password, user.password);

       // Generate OTP and set expiration time
    const otp = generateOTP();
    const otpExpires = Date.now() + 300000; // OTP expires in 5 minutes
   

    if (!user) {
      return res.status(401).json({ error: "Email does not exist" });
    } else if (!isValidPassword) {
      return res.status(401).json({ error: "Incorrect Password" });
    } else {

      await User.findOneAndUpdate(
        { email },
        {
          $set: { otp: otp,otpExpires:otpExpires}
        }
      );
      await sendOtp(email, otp);
      res.json(user);
    }
  } catch (error) {
    console.error("Login error:", error); // Log the error for debugging
    res.status(500).json({ error: "An error occurred" });
  }
};


const verifyOTP = async(req,res)=>{
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  // Check if OTP is correct and not expired
  if (user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // OTP is valid, update user verification status
  await User.findOneAndUpdate(
    { email },
    {
      $set: { isVerified: true },
      $unset: { otp: "", otpExpires: "" }
    }
  );

  res.status(200).json({ message: 'User verified successfully' });
}



const getAllUsers=async(req,res)=>{
  try {
    const users = await User.find();
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
}


module.exports = {
  signup,
  login,
  verifyOTP,
  getAllUsers
};
