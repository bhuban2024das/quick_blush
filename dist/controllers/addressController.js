"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultAddress = exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.getAddresses = void 0;
const data_source_1 = require("../config/data-source");
const Address_1 = require("../entities/Address");
const addressRepository = data_source_1.AppDataSource.getRepository(Address_1.Address);
const getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const addresses = await addressRepository.find({ where: { user: { id: userId } } });
        res.status(200).json(addresses);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching addresses", error });
    }
};
exports.getAddresses = getAddresses;
const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const newAddress = addressRepository.create({ ...req.body, user: { id: userId } });
        await addressRepository.save(newAddress);
        res.status(201).json({ message: "Address added successfully", address: newAddress });
    }
    catch (error) {
        res.status(500).json({ message: "Error adding address", error });
    }
};
exports.addAddress = addAddress;
const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;
        const address = await addressRepository.findOne({ where: { id: addressId, user: { id: userId } } });
        if (!address)
            return res.status(404).json({ message: "Address not found" });
        addressRepository.merge(address, req.body);
        await addressRepository.save(address);
        res.status(200).json({ message: "Address updated successfully", address });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating address", error });
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;
        const result = await addressRepository.delete({ id: addressId, user: { id: userId } });
        if (result.affected === 0)
            return res.status(404).json({ message: "Address not found" });
        res.status(200).json({ message: "Address deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting address", error });
    }
};
exports.deleteAddress = deleteAddress;
const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;
        // Reset all addresses to false
        await data_source_1.AppDataSource.createQueryBuilder()
            .update(Address_1.Address)
            .set({ isDefault: false })
            .where("userId = :userId", { userId })
            .execute();
        // Set requested address to true
        const result = await data_source_1.AppDataSource.createQueryBuilder()
            .update(Address_1.Address)
            .set({ isDefault: true })
            .where("id = :id AND userId = :userId", { id: addressId, userId })
            .execute();
        if (result.affected === 0)
            return res.status(404).json({ message: "Address not found" });
        res.status(200).json({ message: "Default address set successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error setting default address", error });
    }
};
exports.setDefaultAddress = setDefaultAddress;
