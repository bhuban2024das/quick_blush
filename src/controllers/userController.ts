import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";
import { smsService } from "../services/smsService";

const userRepository = AppDataSource.getRepository(User);
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_here";


export const getProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { name, email, gender, addressBook } = req.body;

        const user = await userRepository.findOneBy({ id: userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (name) user.name = name;
        if (email) user.email = email;
        if (gender) user.gender = gender;
        if (addressBook) user.addressBook = addressBook;

        await userRepository.save(user);

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error });
    }
};
