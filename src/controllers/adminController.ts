import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Admin } from "../entities/Admin";
import { Vendor, VendorStatus } from "../entities/Vendor";
import { User } from "../entities/User";
import { ProductKit } from "../entities/ProductKit";
import { ServiceCategory } from "../entities/ServiceCategory";
import { Service } from "../entities/Service";
import { VendorPurchase, PurchasePaymentMode, PurchaseStatus } from "../entities/VendorPurchase";
import jwt from "jsonwebtoken";

const adminRepo = AppDataSource.getRepository(Admin);
const vendorRepo = AppDataSource.getRepository(Vendor);
const userRepo = AppDataSource.getRepository(User);
const kitRepo = AppDataSource.getRepository(ProductKit);
const categoryRepo = AppDataSource.getRepository(ServiceCategory);
const serviceRepo = AppDataSource.getRepository(Service);
const purchaseRepo = AppDataSource.getRepository(VendorPurchase);

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_here";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "super_secret_refresh_key_here";

const generateTokens = (id: string, role: string) => {
    const accessToken = jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id, role }, REFRESH_SECRET, { expiresIn: "30d" });
    return { accessToken, refreshToken };
};

export const loginAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        // In reality, compare hashed password
        const admin = await adminRepo.findOneBy({ email });
        // Simplified check
        if (!admin || password !== "admin123") {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const { accessToken, refreshToken } = generateTokens(admin.id, "ADMIN");
        res.status(200).json({ message: "Admin login successful", accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error });
    }
};

export const getVendors = async (req: Request, res: Response) => {
    try {
        const vendors = await vendorRepo.find();
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ message: "Error fetching vendors", error });
    }
};

export const approveVendor = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.params;
        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        vendor.status = VendorStatus.APPROVED;
        await vendorRepo.save(vendor);
        res.status(200).json({ message: "Vendor approved", vendor });
    } catch (error) {
        res.status(500).json({ message: "Error approving vendor", error });
    }
};

// ... Similar endpoints for rejectVendor, suspendUser, etc.

export const createProductKit = async (req: Request, res: Response) => {
    try {
        const { name, category, brand, usagePurpose, price, stockCount } = req.body;
        const kit = kitRepo.create({ name, category, brand, usagePurpose, price, stockCount });
        await kitRepo.save(kit);
        res.status(201).json({ message: "Product Kit created", kit });
    } catch (error) {
        res.status(500).json({ message: "Error creating kit", error });
    }
};

export const getPurchases = async (req: Request, res: Response) => {
    try {
        const purchases = await purchaseRepo.find({ relations: ["vendor", "kit"] });
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ message: "Error fetching purchases", error });
    }
};
