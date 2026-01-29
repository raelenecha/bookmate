import express from "express";
import Waitlist from "../models/waitlists.js";
import Books from "../models/books.js";
import AttainedRewards from "../models/attained_rewards.js";
import Users from "../models/users.js";
import checkAuth from "../auth.js";

const router = express.Router();
router.use(checkAuth);

// GET /reserved for getting reserved books
router.get("/reserved", async (req, res) => {
	try {
		const reservations = await Books.find({ reservedBy: req.user._id }).populate("categoryId");
		const normalized = reservations.map(b => b.toObject());
		return res.status(200).json(normalized);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
});

// GET /waitlist for getting waitlisted books
router.get("/waitlist", async (req, res) => {
	try {
		const waitlists = await Waitlist
			.find({ userId: req.user._id })
			.populate({
				path: "bookId",
				populate: {
					path: "categoryId",
					model: "Categories"
				}
			});

		const normalized = await Promise.all(
			waitlists.map(async (b) => {
				const book = b.toObject();
				const waitlistCount = await Waitlist.countDocuments({ bookId: book._id });
				return { ...book, waitlistCount };
			})
		);

		return res.status(200).json(normalized);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: error.message });
	}
});

// POST /reservations for creating a reservation/waitlist
router.post("/", async (req, res) => {
	try {
		const { bookId } = req.body;

		if (!bookId) return res.status(400).json({ message: "bookId is required" });

		// Check book exists and is not reserved
		const book = await Books.findById(bookId);
		if (!book) return res.status(400).json({ message: "Book not found" });
		if (book.reservedBy === req.user._id) return res.status(400).json({ message: "Book already reserved" });

		let rewardIds = [];

		// if not reserved, user will reserve without waitlisting
		// if reserved, user will waitlist
		if (book.reservedBy === null || book.reservedBy === "") {
			book.reservedBy = req.user._id;

			// Set due date to be 7 days from now
			const dueDate = new Date();
			dueDate.setDate(dueDate.getDate() + 7);
			book.dueDate = dueDate;
			await book.save();

			// Award the user (successfully reserving book) badge
			rewardIds.push("696897d41929d4cd02125465");

			// Award the user (successfully reserving multiple book) badge
			const bookCount = await Books.countDocuments({ reservedBy: req.user._id });
			if (bookCount > 1) rewardIds.push("696897d41929d4cd02125466");
		} else {
			Waitlist.create({ bookId, userId: req.user._id });
			// Award the user (joining waitlist) badge
			rewardIds.push("696897d41929d4cd02125467");
		}

		// Save the attained reward
		await Promise.all(
			rewardIds.map((rewardId) =>
				AttainedRewards.findOneAndUpdate(
					{ userId: req.user._id, rewardId },
					{
						$setOnInsert: {
							userId: req.user._id,
							rewardId,
							attainedDate: new Date(),
						},
					},
					{ upsert: true }
				)
			)
		);

		return res.status(201).json({ message: "Reservation created" });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
});

// PUT /return for returning a book
router.put("/return", async (req, res) => {
	try {
		const { bookId } = req.body;
		if (!bookId) return res.status(400).json({ message: "bookId is required" });

		// Get book and verify ownership
		const book = await Books.findOne({ _id: bookId, reservedBy: req.user._id });
		if (!book) return res.status(404).json({ message: "Book not found or not reserved" });

		// Give points to returning user (+10) and (-50 if overdue)
		let delta = 30;
		if (book.dueDate && book.dueDate < new Date()) delta -= 50;
		await Users.findByIdAndUpdate(req.user._id, { $inc: { points: delta } });

		// Get waitlist sorted by creation date (oldest first)
		const nextWaitlist = await Waitlist.findOne({ bookId }).sort({ _id: 1 });
		let nextUserId = null;

		// If waitlist exists → assign to first user
		if (nextWaitlist) {
			nextUserId = nextWaitlist.userId;

			// Set new due date (+7 days)
			const dueDate = new Date();
			dueDate.setDate(dueDate.getDate() + 7);

			book.reservedBy = nextUserId;
			book.dueDate = dueDate;

			// Remove the waitlist entry
			await Waitlist.findByIdAndDelete(nextWaitlist._id);
		} else {
			// No waitlist → clear reservation
			book.reservedBy = null;
			book.dueDate = null;
		}

		await book.save();

		if (nextUserId) {
			const bookCount = await Books.countDocuments({ reservedBy: nextUserId });

			const rewardIds = ["696897d41929d4cd02125465"]; // reserved 1st book badge
			if (bookCount > 1) rewardIds.push("696897d41929d4cd02125466"); // multiple books badge

			await Promise.all(
				rewardIds.map((rewardId) =>
					AttainedRewards.findOneAndUpdate(
						{ userId: nextUserId, rewardId },
						{
							$setOnInsert: {
								userId: nextUserId,
								rewardId,
								attainedDate: new Date(),
							},
						},
						{ upsert: true }
					)
				)
			);
		}

		return res.status(200).json({ message: "Book returned successfully" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: error.message });
	}
});

// DELETE /withdraw/:id for waitlist withdrawal
router.delete("/withdraw/:id", async (req, res) => {
	try {
		const deleted = await Waitlist.deleteMany({ bookId: req.params.id, userId: req.user._id });
		if (!deleted) return res.status(404).json({ message: "Waitlist record not found" });
		return res.status(200).json({ message: "Withdrawn from waitlist" });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
});


export default router;
