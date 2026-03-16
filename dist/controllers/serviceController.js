"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddonsByService = exports.createAddon = exports.searchServices = exports.getServicesByCategory = exports.getServiceById = exports.createService = exports.getCategories = exports.createCategory = void 0;
const data_source_1 = require("../config/data-source");
const ServiceCategory_1 = require("../entities/ServiceCategory");
const Service_1 = require("../entities/Service");
const ServiceAddon_1 = require("../entities/ServiceAddon");
const typeorm_1 = require("typeorm");
const categoryRepo = data_source_1.AppDataSource.getRepository(ServiceCategory_1.ServiceCategory);
const serviceRepo = data_source_1.AppDataSource.getRepository(Service_1.Service);
const addonRepo = data_source_1.AppDataSource.getRepository(ServiceAddon_1.ServiceAddon);
// --- CATEGORIES ---
const createCategory = async (req, res) => {
    try {
        const { id, name, description, imageUrl, parentCategoryId, isActive } = req.body;
        if (!id || !name) {
            return res.status(400).json({ message: "id and name are required." });
        }
        const existing = await categoryRepo.findOneBy({ id });
        if (existing) {
            return res.status(400).json({ message: `Category with id '${id}' already exists.` });
        }
        const category = new ServiceCategory_1.ServiceCategory();
        category.id = id;
        category.name = name;
        if (description !== undefined)
            category.description = description;
        if (imageUrl !== undefined)
            category.imageUrl = imageUrl;
        if (isActive !== undefined)
            category.isActive = isActive;
        if (parentCategoryId) {
            const parent = await categoryRepo.findOneBy({ id: parentCategoryId });
            if (!parent)
                return res.status(404).json({ message: "Parent category not found" });
            category.parentCategory = parent;
        }
        await categoryRepo.save(category);
        res.status(201).json({ message: "Category created successfully", category });
    }
    catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Error creating category", error });
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res) => {
    try {
        // Fetch top-level categories with their sub-categories
        const categories = await categoryRepo.find({
            where: { isActive: true, parentCategory: (0, typeorm_1.IsNull)() },
            relations: ["subCategories"]
        });
        res.status(200).json(categories);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching categories", error });
    }
};
exports.getCategories = getCategories;
// --- SERVICES ---
const createService = async (req, res) => {
    try {
        const { id, name, description, categoryId, silverPrice, goldPrice, platinumPrice, productCost, durationMinutes, isActive } = req.body;
        if (!id || !name || silverPrice === undefined || durationMinutes === undefined || !categoryId) {
            return res.status(400).json({ message: "id, name, categoryId, silverPrice, and durationMinutes are required." });
        }
        const existing = await serviceRepo.findOneBy({ id });
        if (existing) {
            return res.status(400).json({ message: `Service with id '${id}' already exists.` });
        }
        const category = await categoryRepo.findOneBy({ id: categoryId });
        if (!category)
            return res.status(404).json({ message: "Category not found" });
        const service = new Service_1.Service();
        service.id = id;
        service.name = name;
        if (description !== undefined)
            service.description = description;
        service.category = category;
        service.silverPrice = Number(silverPrice);
        service.goldPrice = Number(goldPrice || silverPrice);
        service.platinumPrice = Number(platinumPrice || silverPrice);
        service.productCost = Number(productCost || 0);
        service.durationMinutes = Number(durationMinutes);
        if (isActive !== undefined)
            service.isActive = isActive;
        await serviceRepo.save(service);
        res.status(201).json({ message: "Service created successfully", service });
    }
    catch (error) {
        console.error("Error creating service:", error);
        res.status(500).json({ message: "Error creating service", error });
    }
};
exports.createService = createService;
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await serviceRepo.findOne({
            where: { id }
        });
        if (!service)
            return res.status(404).json({ message: "Service not found" });
        res.status(200).json(service);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching service", error });
    }
};
exports.getServiceById = getServiceById;
const getServicesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const services = await serviceRepo.find({
            where: { category: { id: categoryId }, isActive: true }
        });
        res.status(200).json(services);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching services", error });
    }
};
exports.getServicesByCategory = getServicesByCategory;
const searchServices = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== "string") {
            return res.status(400).json({ message: "Search query 'q' is required" });
        }
        const services = await serviceRepo.find({
            where: { name: (0, typeorm_1.ILike)(`%${q}%`), isActive: true }
        });
        res.status(200).json(services);
    }
    catch (error) {
        res.status(500).json({ message: "Error searching services", error });
    }
};
exports.searchServices = searchServices;
// --- ADDONS ---
const createAddon = async (req, res) => {
    try {
        const { id, serviceId, name, price, isActive } = req.body;
        if (!id || !serviceId || !name || price === undefined) {
            return res.status(400).json({ message: "id, serviceId, name, and price are required." });
        }
        const existing = await addonRepo.findOneBy({ id });
        if (existing) {
            return res.status(400).json({ message: `Addon with id '${id}' already exists.` });
        }
        const service = await serviceRepo.findOneBy({ id: serviceId });
        if (!service)
            return res.status(404).json({ message: "Service not found" });
        const addon = new ServiceAddon_1.ServiceAddon();
        addon.id = id;
        addon.service = service;
        addon.name = name;
        addon.price = Number(price);
        if (isActive !== undefined)
            addon.isActive = isActive;
        await addonRepo.save(addon);
        res.status(201).json({ message: "Addon created successfully", addon });
    }
    catch (error) {
        console.error("Error creating addon:", error);
        res.status(500).json({ message: "Error creating addon", error });
    }
};
exports.createAddon = createAddon;
const getAddonsByService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const addons = await addonRepo.find({
            where: { service: { id: serviceId }, isActive: true }
        });
        res.status(200).json(addons);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching addons", error });
    }
};
exports.getAddonsByService = getAddonsByService;
