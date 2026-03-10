"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPurchases = exports.createProductKit = exports.approveVendor = exports.getVendors = exports.loginAdmin = void 0;
const data_source_1 = require("../config/data-source");
const Admin_1 = require("../entities/Admin");
const Vendor_1 = require("../entities/Vendor");
const User_1 = require("../entities/User");
const ProductKit_1 = require("../entities/ProductKit");
const ServiceCategory_1 = require("../entities/ServiceCategory");
const Service_1 = require("../entities/Service");
const VendorPurchase_1 = require("../entities/VendorPurchase");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminRepo = data_source_1.AppDataSource.getRepository(Admin_1.Admin);
const vendorRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
const kitRepo = data_source_1.AppDataSource.getRepository(ProductKit_1.ProductKit);
const categoryRepo = data_source_1.AppDataSource.getRepository(ServiceCategory_1.ServiceCategory);
const serviceRepo = data_source_1.AppDataSource.getRepository(Service_1.Service);
const purchaseRepo = data_source_1.AppDataSource.getRepository(VendorPurchase_1.VendorPurchase);
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_here";
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // In reality, compare hashed password
        const admin = await adminRepo.findOneBy({ email });
        // Simplified check
        if (!admin || password !== "admin123") {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.id, role: "ADMIN" }, JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({ message: "Admin login successful", token });
    }
    catch (error) {
        res.status(500).json({ message: "Login failed", error });
    }
};
exports.loginAdmin = loginAdmin;
const getVendors = async (req, res) => {
    try {
        const vendors = await vendorRepo.find();
        res.status(200).json(vendors);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching vendors", error });
    }
};
exports.getVendors = getVendors;
const approveVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const vendor = await vendorRepo.findOneBy({ id: vendorId });
        if (!vendor)
            return res.status(404).json({ message: "Vendor not found" });
        vendor.status = Vendor_1.VendorStatus.APPROVED;
        await vendorRepo.save(vendor);
        res.status(200).json({ message: "Vendor approved", vendor });
    }
    catch (error) {
        res.status(500).json({ message: "Error approving vendor", error });
    }
};
exports.approveVendor = approveVendor;
// ... Similar endpoints for rejectVendor, suspendUser, etc.
const createProductKit = async (req, res) => {
    try {
        const { name, category, brand, usagePurpose, price, stockCount } = req.body;
        const kit = kitRepo.create({ name, category, brand, usagePurpose, price, stockCount });
        await kitRepo.save(kit);
        res.status(201).json({ message: "Product Kit created", kit });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating kit", error });
    }
};
exports.createProductKit = createProductKit;
const getPurchases = async (req, res) => {
    try {
        const purchases = await purchaseRepo.find({ relations: ["vendor", "kit"] });
        res.status(200).json(purchases);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching purchases", error });
    }
};
exports.getPurchases = getPurchases;
