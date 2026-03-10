"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.verifyOtp = exports.requestOtp = void 0;
const data_source_1 = require("../config/data-source");
const User_1 = require("../entities/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const smsService_1 = require("../services/smsService");
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_here";
const requestOtp = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile)
            return res.status(400).json({ message: "Mobile number required" });
        // Generate a random 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // We could store OTP in Redis for real implementation
        // For now logging it specifically for development visibility while mocking SMS
        console.log(`[AUTH] Generated OTP ${otp} for ${mobile}`);
        await smsService_1.smsService.sendOTP(mobile, otp);
        res.status(200).json({ message: "OTP sent successfully", mockOtp: process.env.NODE_ENV === "development" ? otp : undefined });
    }
    catch (error) {
        res.status(500).json({ message: "Error requesting OTP", error });
    }
};
exports.requestOtp = requestOtp;
const verifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        // Mock validation
        if (otp !== "123456")
            return res.status(400).json({ message: "Invalid OTP" });
        let user = await userRepository.findOneBy({ mobile });
        if (!user) {
            user = userRepository.create({ mobile, name: "New User", isVerified: true });
            await userRepository.save(user);
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: "USER" }, JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({ message: "Login successful", token, user });
    }
    catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error });
    }
};
exports.verifyOtp = verifyOtp;
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userRepository.findOneBy({ id: userId });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching profile", error });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, gender, addressBook } = req.body;
        const user = await userRepository.findOneBy({ id: userId });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (gender)
            user.gender = gender;
        if (addressBook)
            user.addressBook = addressBook;
        await userRepository.save(user);
        res.status(200).json({ message: "Profile updated successfully", user });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating profile", error });
    }
};
exports.updateProfile = updateProfile;
