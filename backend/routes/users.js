import express from "express";
import jsonwebtoken from "jsonwebtoken";
import User from "../models/users.js";
import checkAuth from "../auth.js";
import bcrypt from "bcrypt";

const router = express.Router();

// GET /users for leaderboard
router.get("/", async (req, res) => {
	try {
		const users = await User.find().select("-password").sort({ points: -1 }).limit(10);
		const normalized = users.map(u => u.toObject());
		return res.status(200).json(normalized);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
});

// PUT /users for update account
router.put("/", checkAuth, async (req, res) => {
	try {
		const updates = {};

		if (req.body.name !== undefined) updates.name = req.body.name;
		if (req.body.password !== undefined) updates.password = await bcrypt.hash(req.body.password, 10);
		if (req.body.points !== undefined) updates.points = req.body.points;

		if (Object.keys(updates).length === 0) return res.status(200).json({ message: "No updates provided" });
		
		const updated = await User.findByIdAndUpdate(req.user._id, updates, {
			new: true,
			runValidators: true
		}).select("-password");

		if (!updated) return res.status(404).json({ message: "User not found" });
		const newToken = jsonwebtoken.sign({ ...updated.toObject() }, process.env.JWT_SECRET, { expiresIn: "1d" });
		return res.json({ token: newToken });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
});

// POST /users for account creation
router.post("/", async (req, res) => {
	try {
		const { name, password, role } = req.body;
		if (!name || !password || !role) return res.status(400).json({ message: "Missing required fields" });

		const hashedPassword = await bcrypt.hash(password, 10);
		await User.create({ ...req.body, password: hashedPassword });
		return res.status(201).json({ message: "User created" });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
});

// POST /users/login for login
router.post("/login", async (req, res) => {
	const { name, password } = req.body;
	try {
		const user = await User.findOne({ name });
		if (!user) return res.status(401).json({ message: "Invalid credentials" });

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

		const { password: _, ...safeUser } = user.toObject();
		const token = jsonwebtoken.sign(
			{ ...safeUser },
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		return res.status(200).json({ token });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
});

export default router;
