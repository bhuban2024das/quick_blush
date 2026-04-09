"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeMembership = exports.updateProfile = exports.getProfile = void 0;
const data_source_1 = require("../config/data-source");
const User_1 = require("../entities/User");
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_here";
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userRepository.findOneBy({ id: userId });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching profile", error });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, gender, addressBook } = req.body;
        const user = await userRepository.findOneBy({ id: userId });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (gender)
            user.gender = gender;
        if (addressBook)
            user.addressBook = addressBook;
        await userRepository.save(user);
        res.status(200).json({ message: "Profile updated successfully", user });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating profile", error });
    }
};
exports.updateProfile = updateProfile;
const subscribeMembership = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userRepository.findOneBy({ id: userId });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // Mathematically calculate 6 months from exactly Date.now()
        const now = new Date();
        const expiryDate = new Date(now.setMonth(now.getMonth() + 6));
        const newCoins = Number(user.qbCoins || 0) + 1000;
        await userRepository.update({ id: userId }, {
            isElite: true,
            eliteExpiryDate: expiryDate,
            qbCoins: newCoins
        });
        res.status(200).json({
            message: "Successfully upgraded to Elite Membership!",
            isElite: true,
            eliteExpiryDate: expiryDate,
            qbCoins: newCoins
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error subscribing to Elite Membership", error });
    }
};
exports.subscribeMembership = subscribeMembership;
