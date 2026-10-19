import pool from "../configs/dbConfig.js";
import {  register } from "../services/authService.js";
import { getModeratorByUsername } from "../models/moderators.js";
import dotenv from "dotenv";

dotenv.config();

const seedAdmin = async () => {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
        throw new Error("Admin credentials are missing");
    }

    const existingAdmin = await getModeratorByUsername(username);
    if (existingAdmin) {
        console.log("Admin already exists. Skipping seeding.");
        return;
    }

    await register({
        username,
        password,
        role: "admin"
    });

    console.log("Admin seeded successfully");
};

seedAdmin()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });