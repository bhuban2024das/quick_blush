"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendOtp = exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.socialLogin = exports.refreshToken = exports.logout = exports.login = exports.registerUser = exports.verifyOtp = exports.sendOtp = void 0;
const data_source_1 = require("../config/data-source");
const User_1 = require("../entities/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const smsService_1 = require("../services/smsService");
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_here";
const sendOtp = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile)
            return res.status(400).json({ message: "Mobile number required" });
        // Generate OTP and send (we send it regardless of whether they exist)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Here we'd typically store the OTP in Redis with an expiry
        console.log(`[AUTH] Generated OTP ${otp} for ${mobile}`);
        await smsService_1.smsService.sendOTP(mobile, otp);
        res.status(200).json({ message: "OTP sent successfully", mockOtp: process.env.NODE_ENV === "development" ? otp : undefined });
    }
    catch (error) {
        res.status(500).json({ message: "Error sending OTP", error });
    }
};
exports.sendOtp = sendOtp;
const verifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        // Mock validation, real one should check redis
        if (otp !== "123456")
            return res.status(400).json({ message: "Invalid OTP" });
        let user = await userRepository.findOneBy({ mobile });
        let isNewUser = false;
        if (!user) {
            // First time verifying number: create barebones shell user
            user = userRepository.create({ mobile, isVerified: true });
            await userRepository.save(user);
            isNewUser = true;
        }
        // Regardless of new or existing, issue a token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: "USER" }, JWT_SECRET, { expiresIn: "7d" });
        // If they don't have a name/email/password setup yet, they need to register
        const needsRegistration = !user.name || !user.password;
        if (isNewUser || needsRegistration) {
            res.status(200).json({
                message: "OTP verified. Proceed to register details.",
                token,
                user,
                needsRegistration: true
            });
        }
        else {
            res.status(200).json({
                message: "Login successful",
                token,
                user,
                needsRegistration: false
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error });
    }
};
exports.verifyOtp = verifyOtp;
const registerUser = async (req, res) => {
    try {
        // User must be authenticated (have verified OTP and obtained token)
        const userId = req.user.id;
        const { name, email, password, gender, photo } = req.body;
        if (!name || !password) {
            return res.status(400).json({ message: "Name and password are required" });
        }
        const user = await userRepository.findOneBy({ id: userId });
        if (!user)
            return res.status(404).json({ message: "User not found. Please verify OTP first." });
        if (email) {
            const existingEmail = await userRepository.findOneBy({ email });
            // ensure we aren't clashing with another user
            if (existingEmail && existingEmail.id !== userId) {
                return res.status(400).json({ message: "Email is already in use" });
            }
            user.email = email;
        }
        user.name = name;
        user.password = await bcryptjs_1.default.hash(password, 10);
        if (gender)
            user.gender = gender;
        if (photo)
            user.photo = photo;
        await userRepository.save(user);
        res.status(200).json({
            message: "User registration completed successfully",
            user: {
                id: user.id,
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                gender: user.gender,
                photo: user.photo
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error registering user details", error });
    }
};
exports.registerUser = registerUser;
const login = async (req, res) => {
    try {
        const { emailOrMobile, password } = req.body;
        if (!emailOrMobile || !password) {
            return res.status(400).json({ message: "Email/Mobile and password are required" });
        }
        // Check if the identifier is an email (contains @) or mobile
        const isEmail = emailOrMobile.includes("@");
        const user = await userRepository.findOne({
            where: isEmail ? { email: emailOrMobile } : { mobile: emailOrMobile }
        });
        if (!user || (!user.password)) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Compare the provided password with the hashed one
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: "USER" }, JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({ message: "Login successful", token, user });
    }
    catch (error) {
        res.status(500).json({ message: "Error during login", error });
    }
};
exports.login = login;
const logout = async (req, res) => {
    // Usually handled client side by dropping token or invalidating in Redis
    res.status(200).json({ message: "Logout successful" });
};
exports.logout = logout;
const refreshToken = async (req, res) => {
    res.status(200).json({ message: "Refresh token endpoint" });
};
exports.refreshToken = refreshToken;
const socialLogin = async (req, res) => {
    res.status(200).json({ message: "Social login endpoint" });
};
exports.socialLogin = socialLogin;
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const user = await userRepository.findOneBy({ id: userId });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // If user never had a password (OTP login only), current password isn't required
        if (user.password) {
            if (!currentPassword)
                return res.status(400).json({ message: "Current password is required" });
            const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isMatch)
                return res.status(400).json({ message: "Invalid current password" });
        }
        user.password = await bcryptjs_1.default.hash(newPassword, 10);
        await userRepository.save(user);
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error changing password", error });
    }
};
exports.changePassword = changePassword;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: "Email is required" });
        const user = await userRepository.findOneBy({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // Generate a 6-digit reset OTP
        const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
        // Typically store resetOtp in Redis with an expiry mapped to user email
        console.log(`[AUTH] Password Reset OTP ${resetOtp} generated for ${email}`);
        // In a real scenario, this would send an email. For now, we simulate success.
        res.status(200).json({
            message: "Password reset OTP sent to email",
            mockOtp: process.env.NODE_ENV === "development" ? resetOtp : undefined
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error in forgot password", error });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Email, OTP, and new password are required" });
        }
        // Mock OTP validation (in reality, check Redis)
        if (otp !== "123456") {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        const user = await userRepository.findOneBy({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        user.password = await bcryptjs_1.default.hash(newPassword, 10);
        await userRepository.save(user);
        res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error resetting password", error });
    }
};
exports.resetPassword = resetPassword;
const verifyEmail = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, otp } = req.body;
        const user = await userRepository.findOneBy({ id: userId });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (!otp) {
            // Step 1: Request OTP
            if (!email)
                return res.status(400).json({ message: "Email is required to send verification OTP" });
            const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
            console.log(`[AUTH] Email Verification OTP ${verificationOtp} generated for ${email}`);
            // Replace with actual email service call later
            return res.status(200).json({
                message: "Verification OTP sent to email",
                mockOtp: process.env.NODE_ENV === "development" ? verificationOtp : undefined
            });
        }
        else {
            // Step 2: Verify OTP
            // Mock validation
            if (otp !== "123456") {
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }
            user.isVerified = true;
            if (email)
                user.email = email;
            await userRepository.save(user);
            return res.status(200).json({ message: "Email verified successfully" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error verifying email", error });
    }
};
exports.verifyEmail = verifyEmail;
const resendOtp = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile)
            return res.status(400).json({ message: "Mobile number required" });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Here we'd typically store the OTP in Redis with an expiry
        console.log(`[AUTH] Resent OTP ${otp} to ${mobile}`);
        await smsService_1.smsService.sendOTP(mobile, otp);
        res.status(200).json({
            message: "OTP resent successfully",
            mockOtp: process.env.NODE_ENV === "development" ? otp : undefined
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error resending OTP", error });
    }
};
exports.resendOtp = resendOtp;
