import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Address } from "../entities/Address";
import { User } from "../entities/User";

const addressRepository = AppDataSource.getRepository(Address);

export const getAddresses = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const addresses = await addressRepository.find({ where: { user: { id: userId } } });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching addresses", error });
    }
};

export const addAddress = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const newAddress = addressRepository.create({ ...req.body, user: { id: userId } });
        await addressRepository.save(newAddress);
        res.status(201).json({ message: "Address added successfully", address: newAddress });
    } catch (error) {
        res.status(500).json({ message: "Error adding address", error });
    }
};

export const updateAddress = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;

        const address = await addressRepository.findOne({ where: { id: addressId, user: { id: userId } } });
        if (!address) return res.status(404).json({ message: "Address not found" });

        addressRepository.merge(address, req.body);
        await addressRepository.save(address);

        res.status(200).json({ message: "Address updated successfully", address });
    } catch (error) {
        res.status(500).json({ message: "Error updating address", error });
    }
};

export const deleteAddress = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;

        const result = await addressRepository.delete({ id: addressId, user: { id: userId } });
        if (result.affected === 0) return res.status(404).json({ message: "Address not found" });

        res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting address", error });
    }
};

export const setDefaultAddress = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;

        // Reset all addresses to false
        await AppDataSource.createQueryBuilder()
            .update(Address)
            .set({ isDefault: false })
            .where("userId = :userId", { userId })
            .execute();

        // Set requested address to true
        const result = await AppDataSource.createQueryBuilder()
            .update(Address)
            .set({ isDefault: true })
            .where("id = :id AND userId = :userId", { id: addressId, userId })
            .execute();
            
        if (result.affected === 0) return res.status(404).json({ message: "Address not found" });

        res.status(200).json({ message: "Default address set successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error setting default address", error });
    }
};
