import express from "express";
import Book from "../models/books.js";
import "../models/categories.js";
import Waitlist from "../models/waitlists.js";
import checkAuth from "../auth.js";
import Categories from "../models/categories.js";

const router = express.Router();
router.use(checkAuth);

// GET /books for book catalogue
router.get("/", async (req, res) => {
	try {
		const books = await Book.find().populate('categoryId');
		const normalized = await Promise.all(
			books.map(async (b) => {
				const book = b.toObject();
				const waitlistCount = await Waitlist.countDocuments({ bookId: book._id });
				return { ...book, waitlistCount };
			})
		);
		return res.json(normalized);
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

// GET /books/top-rated for getting top rated books
router.get('/top-rated', async (req, res) => {
	try {
		const books = await Book.find().populate('categoryId').sort({ rating: -1 }).limit(3);
		const normalized = await Promise.all(
			books.map(async (b) => {
				const book = b.toObject();
				const waitlistCount = await Waitlist.countDocuments({ bookId: book._id });
				return { ...book, waitlistCount };
			})
		);
		return res.json(normalized);
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

// GET /categories for getting all categories of books (admin only)
router.get('/categories', async (req, res) => {
	try {
		const categories = await Categories.find();
		const normalized = categories.map(c => c.toObject());
		return res.json(normalized);
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
})

// GET /books/{id} for getting a specific book details
router.get("/:id", async (req, res) => {
	try {
		const book = await Book.findById(req.params.id).populate("categoryId");
		if (!book) return res.status(404).json({ message: "Book not found" });

		const waitlistCount = await Waitlist.countDocuments({ bookId: req.params.id });
		const userInWaitlist = await Waitlist.findOne({ bookId: req.params.id, userId: req.user._id });
		const reservedByOthers = book.reservedBy && book.reservedBy !== "" && book.reservedBy !== req.user._id;

		const obj = book.toObject();
		return res.json({ ...obj, waitlistCount, userInWaitlist, reservedByOthers });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

// PATCH /books/{id} for updating a book's rating
router.patch("/:id", async (req, res) => {
	try {
		const rating = req.body.rating;
		if (!rating) return res.status(400).json({ message: "Rating is required" });
		if (rating < 0 || rating > 5) return res.status(400).json({ message: "Rating must be between 0 and 5" });

		const book = await Book.findById(req.params.id);
		if (!book) return res.status(404).json({ message: "Book not found" });

		book.rating.push(req.body.rating);
		await book.save();
		return res.status(200).json({ message: "Rating updated" });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

// Helper function to check if an image URL is valid
const isValidImageUrl = async (url) => {
	try {
		const res = await fetch(url, {
			method: "HEAD",
			signal: AbortSignal.timeout(5000),
		});

		if (!res.ok) return false;

		const contentType = res.headers.get("content-type");
		return contentType?.startsWith("image/");
	} catch {
		return false;
	}
};

// POST /books for creating a book (admin only)
router.post("/", async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ message: "Unauthorised" });

		const { title, author, categoryId, image, description } = req.body;
		if (!title || !author || !categoryId || !image || !description) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		if (!await isValidImageUrl(image)) {
			return res.status(400).json({ message: "Invalid image URL" });
		}

		await Book.create(req.body);
		return res.status(201).json({ message: "Book created" });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

// PUT /books/{id} for updating a book (admin only)
router.put("/", async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ message: "Unauthorised" });

		const { title, author, categoryId, image, description, bookId } = req.body;
		if (!title || !author || !categoryId || !image || !description || !bookId) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		if (!await isValidImageUrl(image)) {
			return res.status(400).json({ message: "Invalid image URL" });
		}

		await Book.findByIdAndUpdate(bookId, req.body);
		return res.status(200).json({ message: "Book updated" });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
})

// DELETE /books/{id} for deleting a book (admin only)
router.delete("/:id", async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ message: "Unauthorised" });
		
		const deleted = await Book.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ message: "Book not found" });
		
		return res.status(200).json({ message: "Book deleted" });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
})

export default router;