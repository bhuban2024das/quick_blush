"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchServices = exports.getServicesByCategory = exports.getCategories = void 0;
const data_source_1 = require("../config/data-source");
const ServiceCategory_1 = require("../entities/ServiceCategory");
const Service_1 = require("../entities/Service");
const typeorm_1 = require("typeorm");
const categoryRepo = data_source_1.AppDataSource.getRepository(ServiceCategory_1.ServiceCategory);
const serviceRepo = data_source_1.AppDataSource.getRepository(Service_1.Service);
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
