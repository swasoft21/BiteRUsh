import userModel from "../models/userModal.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";


const loginUser = async (req, res) => { 

    const { email, password } = req.body;
    try{
        const user = await userModel.findOne({ email});
        if (!user) {
            return res.json({
                success:false,
                message:"User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({
                success:false,
                message:"Invalid credentials"});
        }
        const token = createToken(user._id);
        return res.json({
            success:true,
            message:"Login successful",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email
            }
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }

}

// Generate JWT Token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Check if user already exists
    const exists = await userModel.findOne({ email });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Validate password
    if (!validator.isStrongPassword(password, {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters and include uppercase, lowercase, and a number.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    // Save user
    const user = await newUser.save();

    // Generate token
    const token = createToken(user._id);

    // Send response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { loginUser,registerUser };