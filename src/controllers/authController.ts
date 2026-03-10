import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { smsService } from "../services/smsService";

const userRepository = AppDataSource.getRepository(User);
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_here";

export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { mobile } = req.body;
        if (!mobile) return res.status(400).json({ message: "Mobile number required" });

        // Generate OTP and send (we send it regardless of whether they exist)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Here we'd typically store the OTP in Redis with an expiry
        console.log(`[AUTH] Generated OTP ${otp} for ${mobile}`);

        await smsService.sendOTP(mobile, otp);

        res.status(200).json({ message: "OTP sent successfully", mockOtp: process.env.NODE_ENV === "development" ? otp : undefined });
    } catch (error) {
        res.status(500).json({ message: "Error sending OTP", error });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { mobile, otp } = req.body;
        // Mock validation, real one should check redis
        if (otp !== "123456") return res.status(400).json({ message: "Invalid OTP" });

        let user = await userRepository.findOneBy({ mobile });
        let isNewUser = false;

        if (!user) {
            // First time verifying number: create barebones shell user
            user = userRepository.create({ mobile, isVerified: true });
            await userRepository.save(user);
            isNewUser = true;
        }

        // Regardless of new or existing, issue a token
        const token = jwt.sign({ id: user.id, role: "USER" }, JWT_SECRET, { expiresIn: "7d" });

        // If they don't have a name/email/password setup yet, they need to register
        const needsRegistration = !user.name || !user.password;

        if (isNewUser || needsRegistration) {
            res.status(200).json({
                message: "OTP verified. Proceed to register details.",
                token,
                user,
                needsRegistration: true
            });
        } else {
            res.status(200).json({
                message: "Login successful",
                token,
                user,
                needsRegistration: false
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error });
    }
};

export const registerUser = async (req: Request, res: Response) => {
    try {
        // User must be authenticated (have verified OTP and obtained token)
        const userId = (req as any).user.id;
        const { name, email, password, gender, photo } = req.body;

        if (!name || !password) {
            return res.status(400).json({ message: "Name and password are required" });
        }

        const user = await userRepository.findOneBy({ id: userId });
        if (!user) return res.status(404).json({ message: "User not found. Please verify OTP first." });

        if (email) {
            const existingEmail = await userRepository.findOneBy({ email });
            // ensure we aren't clashing with another user
            if (existingEmail && existingEmail.id !== userId) {
                return res.status(400).json({ message: "Email is already in use" });
            }
            user.email = email;
        }

        user.name = name;
        user.password = await bcrypt.hash(password, 10);

        if (gender) user.gender = gender;
        if (photo) user.photo = photo;

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
    } catch (error) {
        res.status(500).json({ message: "Error registering user details", error });
    }
};

export const login = async (req: Request, res: Response) => {
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
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, role: "USER" }, JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        res.status(500).json({ message: "Error during login", error });
    }
};

export const logout = async (req: Request, res: Response) => {
    // Usually handled client side by dropping token or invalidating in Redis
    res.status(200).json({ message: "Logout successful" });
};

export const refreshToken = async (req: Request, res: Response) => {
    res.status(200).json({ message: "Refresh token endpoint" });
};

export const socialLogin = async (req: Request, res: Response) => {
    res.status(200).json({ message: "Social login endpoint" });
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await userRepository.findOneBy({ id: userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        // If user never had a password (OTP login only), current password isn't required
        if (user.password) {
            if (!currentPassword) return res.status(400).json({ message: "Current password is required" });
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ message: "Invalid current password" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await userRepository.save(user);

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error changing password", error });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await userRepository.findOneBy({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate a 6-digit reset OTP
        const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
        // Typically store resetOtp in Redis with an expiry mapped to user email
        console.log(`[AUTH] Password Reset OTP ${resetOtp} generated for ${email}`);

        // In a real scenario, this would send an email. For now, we simulate success.
        res.status(200).json({
            message: "Password reset OTP sent to email",
            mockOtp: process.env.NODE_ENV === "development" ? resetOtp : undefined
        });
    } catch (error) {
        res.status(500).json({ message: "Error in forgot password", error });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
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
        if (!user) return res.status(404).json({ message: "User not found" });

        user.password = await bcrypt.hash(newPassword, 10);
        await userRepository.save(user);

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password", error });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { email, otp } = req.body;

        const user = await userRepository.findOneBy({ id: userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!otp) {
            // Step 1: Request OTP
            if (!email) return res.status(400).json({ message: "Email is required to send verification OTP" });

            const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
            console.log(`[AUTH] Email Verification OTP ${verificationOtp} generated for ${email}`);

            // Replace with actual email service call later
            return res.status(200).json({
                message: "Verification OTP sent to email",
                mockOtp: process.env.NODE_ENV === "development" ? verificationOtp : undefined
            });
        } else {
            // Step 2: Verify OTP
            // Mock validation
            if (otp !== "123456") {
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }

            user.isVerified = true;
            if (email) user.email = email;
            await userRepository.save(user);

            return res.status(200).json({ message: "Email verified successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error verifying email", error });
    }
};

export const resendOtp = async (req: Request, res: Response) => {
    try {
        const { mobile } = req.body;
        if (!mobile) return res.status(400).json({ message: "Mobile number required" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Here we'd typically store the OTP in Redis with an expiry
        console.log(`[AUTH] Resent OTP ${otp} to ${mobile}`);

        await smsService.sendOTP(mobile, otp);

        res.status(200).json({
            message: "OTP resent successfully",
            mockOtp: process.env.NODE_ENV === "development" ? otp : undefined
        });
    } catch (error) {
        res.status(500).json({ message: "Error resending OTP", error });
    }
};
