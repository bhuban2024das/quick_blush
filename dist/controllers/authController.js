"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.socialLogin = exports.logout = exports.refreshToken = exports.validateToken = exports.registerUser = exports.verifyOtp = exports.resendOtp = exports.sendOtp = void 0;
const data_source_1 = require("../config/data-source");
const User_1 = require("../entities/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const smsService_1 = require("../services/smsService");
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_here";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "super_secret_refresh_key_here";
// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateTokens = (id, role) => {
    const accessToken = jsonwebtoken_1.default.sign({ id, role }, JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jsonwebtoken_1.default.sign({ id, role }, REFRESH_SECRET, { expiresIn: "30d" });
    return { accessToken, refreshToken };
};
// ─── OTP Flow ────────────────────────────────────────────────────────────────
const sendOtp = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile)
            return res.status(400).json({ message: "Mobile number required" });
        // Bypass Twilio — hardcoded OTP is 123456
        const otp = "123456";
        console.log(`[AUTH][TESTING] OTP for ${mobile} is ${otp} (Twilio disabled)`);
        // Mock save it into memory store
        await smsService_1.smsService.sendOTP(mobile, otp);
        res.status(200).json({
            message: "OTP sent successfully",
            mockOtp: process.env.NODE_ENV === "development" ? otp : undefined
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error sending OTP", error });
    }
};
exports.sendOtp = sendOtp;
const resendOtp = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile)
            return res.status(400).json({ message: "Mobile number required" });
        const otp = "123456";
        console.log(`[AUTH][TESTING] Resent OTP ${otp} to ${mobile} (Twilio disabled)`);
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
const verifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        if (!mobile || !otp) {
            return res.status(400).json({ message: "Mobile number and OTP are required" });
        }
        // Mock validation — replace with Redis lookup in production
        if (otp !== "123456")
            return res.status(400).json({ message: "Invalid OTP" });
        let user = await userRepository.findOneBy({ mobile });
        let isNewUser = false;
        if (!user) {
            user = userRepository.create({ mobile, isVerified: true });
            await userRepository.save(user); // Insert first to generate UUID
            isNewUser = true;
        }
        const { accessToken, refreshToken } = generateTokens(user.id, "USER");
        // Persist refresh token
        user.refreshToken = refreshToken;
        await userRepository.save(user);
        const needsRegistration = !user.name;
        if (isNewUser || needsRegistration) {
            return res.status(200).json({
                message: "OTP verified. Proceed to register details.",
                accessToken,
                refreshToken,
                user,
                needsRegistration: true
            });
        }
        return res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user,
            needsRegistration: false
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error });
    }
};
exports.verifyOtp = verifyOtp;
// ─── Registration ─────────────────────────────────────────────────────────────
/**
 * POST /auth/register-details  (protected)
 * Called after OTP verification when needsRegistration === true.
 * Requires: name
 * Optional: email, gender, photo
 */
const registerUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, gender, photo } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }
        const user = await userRepository.findOneBy({ id: userId });
        if (!user)
            return res.status(404).json({ message: "User not found. Please verify OTP first." });
        if (email) {
            const existingEmail = await userRepository.findOneBy({ email });
            if (existingEmail && existingEmail.id !== userId) {
                return res.status(400).json({ message: "Email is already in use" });
            }
            user.email = email;
        }
        user.name = name;
        if (gender)
            user.gender = gender;
        if (photo)
            user.photo = photo;
        await userRepository.save(user);
        return res.status(200).json({
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
// ─── Token ────────────────────────────────────────────────────────────────────
/**
 * GET /auth/validate-token  (public)
 * Checks whether the Bearer access token is valid.
 * Always returns HTTP 200 — check `valid` in response body.
 */
const validateToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(200).json({ valid: false, message: "No token provided" });
        }
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch {
            return res.status(200).json({ valid: false, message: "Invalid or expired token" });
        }
        const user = await userRepository.findOneBy({ id: decoded.id });
        if (!user) {
            return res.status(200).json({ valid: false, message: "User not found" });
        }
        return res.status(200).json({
            valid: true,
            user: {
                id: user.id,
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                gender: user.gender,
                photo: user.photo,
                isVerified: user.isVerified,
                walletBalance: user.walletBalance
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error validating token", error });
    }
};
exports.validateToken = validateToken;
/**
 * POST /auth/refresh-token  (public)
 * Accepts a refresh token, validates it against the DB, and issues a new access + refresh token pair.
 */
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Refresh token is required" });
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
        }
        catch {
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }
        const user = await userRepository.findOneBy({ id: decoded.id });
        if (!user || user.refreshToken !== token) {
            return res.status(401).json({ message: "Refresh token mismatch or user not found" });
        }
        // Rotate tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, decoded.role);
        user.refreshToken = newRefreshToken;
        await userRepository.save(user);
        return res.status(200).json({
            message: "Tokens refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error refreshing token", error });
    }
};
exports.refreshToken = refreshToken;
// ─── Session ──────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (userId) {
            const user = await userRepository.findOneBy({ id: userId });
            if (user) {
                user.refreshToken = "";
                await userRepository.save(user);
            }
        }
        res.status(200).json({ message: "Logout successful" });
    }
    catch (error) {
        res.status(500).json({ message: "Error during logout", error });
    }
};
exports.logout = logout;
const socialLogin = async (_req, res) => {
    res.status(200).json({ message: "Social login endpoint" });
};
exports.socialLogin = socialLogin;
// ─── Email Verification ───────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, otp } = req.body;
        const user = await userRepository.findOneBy({ id: userId });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (!otp) {
            // Step 1: Send OTP to the provided email
            if (!email)
                return res.status(400).json({ message: "Email is required to send verification OTP" });
            const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
            console.log(`[AUTH] Email Verification OTP ${verificationOtp} generated for ${email}`);
            return res.status(200).json({
                message: "Verification OTP sent to email",
                mockOtp: process.env.NODE_ENV === "development" ? verificationOtp : undefined
            });
        }
        // Step 2: Verify the OTP
        if (otp !== "123456") {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        user.isVerified = true;
        if (email)
            user.email = email;
        await userRepository.save(user);
        return res.status(200).json({ message: "Email verified successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error verifying email", error });
    }
};
exports.verifyEmail = verifyEmail;
