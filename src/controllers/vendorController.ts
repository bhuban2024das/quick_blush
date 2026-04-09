import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Vendor, VendorStatus } from "../entities/Vendor";
import { ServiceCategory } from "../entities/ServiceCategory";
import { In } from "typeorm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { smsService } from "../services/smsService";

const vendorRepo = AppDataSource.getRepository(Vendor);
const categoryRepo = AppDataSource.getRepository(ServiceCategory);

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_here";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "super_secret_refresh_key_here";

const generateTokens = (id: string, role: string) => {
    const accessToken = jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id, role }, REFRESH_SECRET, { expiresIn: "30d" });
    return { accessToken, refreshToken };
};

export const registerVendor = async (req: Request, res: Response) => {
    try {
        const { name, email, mobile, password, address, age, photo, experienceYears, serviceCategoryIds } = req.body;

        const existingVendor = await vendorRepo.findOne({ where: [{ email }, { mobile }] });
        if (existingVendor) return res.status(400).json({ message: "Vendor already exists with this email or mobile" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const vendor = vendorRepo.create({
            name,
            email,
            mobile,
            password: hashedPassword,
            address,
            age,
            photo,
            experienceYears,
            status: VendorStatus.PENDING
        });

        if (serviceCategoryIds && serviceCategoryIds.length > 0) {
            const categories = await categoryRepo.findBy({ id: In(serviceCategoryIds) });
            vendor.serviceCategories = categories;
        }

        await vendorRepo.save(vendor);

        // Generate Random OTP and send SMS confirmation
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Temporarily log for development when ignoring mocked twilio
        console.log(`[VENDOR AUTH] Generated OTP ${otp} for Vendor ${vendor.mobile}`);
        
        await smsService.sendOTP(vendor.mobile, otp);

        res.status(201).json({ message: "Vendor registered successfully. OTP sent for verification.", vendorId: vendor.id });
    } catch (error) {
        res.status(500).json({ message: "Error registering vendor", error });
    }
};

export const verifyVendorOtp = async (req: Request, res: Response) => {
    try {
        const { mobile, otp } = req.body;
        
        const vendor = await vendorRepo.findOneBy({ mobile });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        const isVerified = await smsService.verifyOTP(mobile, otp);
        if (!isVerified) return res.status(400).json({ message: "Invalid or expired OTP" });

        vendor.isVerified = true;
        await vendorRepo.save(vendor);

        res.status(200).json({ message: "OTP verified successfully. You can now login.", vendor });
    } catch (error) {
         res.status(500).json({ message: "Error verifying OTP", error });
    }
};

export const loginVendor = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        
        const vendor = await vendorRepo.findOneBy({ email });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        if (vendor.status === VendorStatus.REJECTED || vendor.status === VendorStatus.SUSPENDED) {
            return res.status(403).json({ message: `Access denied. Vendor status: ${vendor.status}` });
        }

        const { accessToken, refreshToken } = generateTokens(vendor.id, "VENDOR");

        vendor.refreshToken = refreshToken;
        await vendorRepo.save(vendor);

        res.status(200).json({ message: "Login successful", accessToken, refreshToken, vendor });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error });
    }
};

export const sendVendorOtpLogin = async (req: Request, res: Response) => {
    try {
        const { mobile } = req.body;
        
        const vendor = await vendorRepo.findOneBy({ mobile });
        if (!vendor) return res.status(404).json({ message: "No vendor registered with this mobile number." });

        if (vendor.status === VendorStatus.REJECTED || vendor.status === VendorStatus.SUSPENDED) {
            return res.status(403).json({ message: `Access denied. Vendor status: ${vendor.status}` });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[VENDOR LOGIN] Generated OTP ${otp} for Vendor ${mobile}`);
        
        await smsService.sendOTP(mobile, otp);

        res.status(200).json({ message: "OTP sent successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error sending OTP", error });
    }
};

export const loginVendorOtp = async (req: Request, res: Response) => {
    try {
        const { mobile, otp } = req.body;
        
        const vendor = await vendorRepo.findOne({
            where: { mobile },
            relations: ["serviceCategories", "subscriptions"]
        });
        if (!vendor) return res.status(404).json({ message: "Vendor not found." });

        const isVerified = await smsService.verifyOTP(mobile, otp);
        if (!isVerified) return res.status(400).json({ message: "Invalid or expired OTP." });

        if (vendor.status === VendorStatus.REJECTED || vendor.status === VendorStatus.SUSPENDED) {
            return res.status(403).json({ message: `Access denied. Vendor status: ${vendor.status}` });
        }

        // Generate Tokens
        const { accessToken, refreshToken } = generateTokens(vendor.id, "VENDOR");

        vendor.refreshToken = refreshToken;
        await vendorRepo.save(vendor);

        res.status(200).json({ message: "Login successful", accessToken, refreshToken, vendor });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error });
    }
};


export const refreshVendorToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) return res.status(400).json({ message: "Refresh token is required" });

        let decoded: any;
        try {
            decoded = jwt.verify(token, REFRESH_SECRET);
        } catch {
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }

        const vendor = await vendorRepo.findOneBy({ id: decoded.id });
        if (!vendor || vendor.refreshToken !== token) {
            return res.status(401).json({ message: "Refresh token mismatch or vendor not found" });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(vendor.id, "VENDOR");
        vendor.refreshToken = newRefreshToken;
        await vendorRepo.save(vendor);

        return res.status(200).json({
            message: "Tokens refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        res.status(500).json({ message: "Error refreshing token", error });
    }
};

export const getVendorProfile = async (req: any, res: Response) => {
    try {
        const vendorId = req.user.id;
        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });
        res.status(200).json(vendor);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error });
    }
};

export const updateVendorProfile = async (req: any, res: Response) => {
    try {
        const vendorId = req.user.id;
        const { photo, isOnline, location } = req.body; // Location could be GeoJSON point

        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        if (photo) vendor.photo = photo;
        if (typeof isOnline === "boolean") vendor.isOnline = isOnline;
        if (location) vendor.location = location; // Simple storage for now

        await vendorRepo.save(vendor);
        res.status(200).json({ message: "Profile updated", vendor });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error });
    }
};

export const uploadVendorDocument = async (req: any, res: Response) => {
    try {
        const vendorId = req.user.id;
        const { documentUrl } = req.body;

        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        vendor.documentUrl = documentUrl;
        
        await vendorRepo.save(vendor);
        res.status(200).json({ message: "Document uploaded successfully", vendor });
    } catch (error) {
        res.status(500).json({ message: "Error uploading document", error });
    }
};

export const updateVendorLocation = async (req: any, res: Response) => {
    try {
        const vendorId = req.user.id;
        const { lat, lng } = req.body;

        await vendorRepo.createQueryBuilder()
            .update(Vendor)
            .set({ location: () => `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)` })
            .where("id = :id", { id: vendorId })
            .execute();

        res.status(200).json({ message: "Location updated successfully" });
    } catch (error) {
        console.error("Error updating location:", error);
        res.status(500).json({ message: "Error updating location", error });
    }
};

export const updateVendorFcmToken = async (req: any, res: Response) => {
    try {
        const vendorId = req.user.id;
        const { fcmToken } = req.body;

        if (!fcmToken) {
            return res.status(400).json({ message: "fcmToken is required" });
        }

        await vendorRepo.update(vendorId, { fcmToken });
        res.status(200).json({ message: "FCM token updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating FCM token", error });
    }
};
