"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVendorProfile = exports.getVendorProfile = exports.loginVendor = exports.registerVendor = void 0;
const data_source_1 = require("../config/data-source");
const Vendor_1 = require("../entities/Vendor");
const ServiceCategory_1 = require("../entities/ServiceCategory");
const typeorm_1 = require("typeorm");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const smsService_1 = require("../services/smsService");
const vendorRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
const categoryRepo = data_source_1.AppDataSource.getRepository(ServiceCategory_1.ServiceCategory);
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_here";
const registerVendor = async (req, res) => {
    try {
        const { name, email, mobile, password, serviceCategoryIds } = req.body;
        const existingVendor = await vendorRepo.findOne({ where: [{ email }, { mobile }] });
        if (existingVendor)
            return res.status(400).json({ message: "Vendor already exists with this email or mobile" });
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const vendor = vendorRepo.create({
            name,
            email,
            mobile,
            password: hashedPassword,
            status: Vendor_1.VendorStatus.PENDING
        });
        if (serviceCategoryIds && serviceCategoryIds.length > 0) {
            const categories = await categoryRepo.findBy({ id: (0, typeorm_1.In)(serviceCategoryIds) });
            vendor.serviceCategories = categories;
        }
        await vendorRepo.save(vendor);
        // Generate Random OTP and send SMS confirmation
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Temporarily log for development when ignoring mocked twilio
        console.log(`[VENDOR AUTH] Generated OTP ${otp} for Vendor ${vendor.mobile}`);
        await smsService_1.smsService.sendOTP(vendor.mobile, otp);
        res.status(201).json({ message: "Vendor registered successfully. OTP sent for verification." });
    }
    catch (error) {
        res.status(500).json({ message: "Error registering vendor", error });
    }
};
exports.registerVendor = registerVendor;
const loginVendor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const vendor = await vendorRepo.findOneBy({ email });
        if (!vendor)
            return res.status(404).json({ message: "Vendor not found" });
        const isMatch = await bcrypt_1.default.compare(password, vendor.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });
        if (vendor.status === Vendor_1.VendorStatus.PENDING || vendor.status === Vendor_1.VendorStatus.REJECTED || vendor.status === Vendor_1.VendorStatus.SUSPENDED) {
            return res.status(403).json({ message: `Access denied. Vendor status: ${vendor.status}` });
        }
        const token = jsonwebtoken_1.default.sign({ id: vendor.id, role: "VENDOR" }, JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({ message: "Login successful", token, vendor });
    }
    catch (error) {
        res.status(500).json({ message: "Login failed", error });
    }
};
exports.loginVendor = loginVendor;
const getVendorProfile = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor)
            return res.status(404).json({ message: "Vendor not found" });
        res.status(200).json(vendor);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching profile", error });
    }
};
exports.getVendorProfile = getVendorProfile;
const updateVendorProfile = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { photo, isOnline, location } = req.body; // Location could be GeoJSON point
        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor)
            return res.status(404).json({ message: "Vendor not found" });
        if (photo)
            vendor.photo = photo;
        if (typeof isOnline === "boolean")
            vendor.isOnline = isOnline;
        if (location)
            vendor.location = location; // Simple storage for now
        await vendorRepo.save(vendor);
        res.status(200).json({ message: "Profile updated", vendor });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating profile", error });
    }
};
exports.updateVendorProfile = updateVendorProfile;
