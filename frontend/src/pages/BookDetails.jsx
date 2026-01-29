import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation, useOutletContext } from "react-router-dom";
import StarRating from "../components/StarRating.jsx";
import api from "../components/Request.js";
import { useAuth } from "../components/UserAuth.jsx";
import "../styles/BookDetails.scss";

export default function BookDetails() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, loading } = useAuth();
	const { bookId } = useParams();
	const { setHeaderProps } = useOutletContext();
	const breadcrumb = location.state?.breadcrumb || [{ label: "Home", to: "/home" }];
	const [book, setBook] = useState(null);

	useEffect(() => {
		if (loading) return;
		if (!user) return navigate("/login");
		setHeaderProps({ showHome: true });
		const controller = new AbortController();

		const fetchData = async () => {
			try {
				// Fetch book details from MongoDB backend
				const bookRes = await api.get(`/books/${bookId}`, {
					signal: controller.signal,
				});

				document.title = `Bookmate | ${bookRes.data.title || "Book"}`;
				setBook(bookRes.data);
			} catch (err) {
				if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
				console.error("BookDetails fetch error:", err);
			}
		};

		fetchData();
		return () => controller.abort();
	}, [bookId, user, navigate]);

	const alreadyReserved = useMemo(() => {
		if (!book || !user) return false;
		return book.reservedBy === user._id;
	}, [book, user]);

	const handleReserve = async () => {
		if (!book || !user) return;

		const controller = new AbortController();

		try {
			// Create reservation record in MongoDB
			const reserve = await api.post("/reservations", { bookId }, { signal: controller.signal });

			alert(reserve.data.message);
			navigate(`/home`);
		} catch (err) {
			if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
			console.error(err);
			alert("Failed to reserve: " + (err.response?.data?.message || err.message));
		} finally {
			setSaving(false);
			controller.abort();
		}
	};

	const handleWithdraw = async () => {
		try {
			// Delete reservation record in MongoDB
			const withdraw = await api.delete(`/reservations/withdraw/${book._id}`);
			alert(withdraw.data.message)
			navigate(`/home`);
		} catch (err) {
			console.error(err);
			alert("Failed to withdraw: " + (err.response?.data?.message || err.message));
		}
	}

	const handleRate = async () => {
		if (!book || !user) return;

		const rating = prompt("Rate this book (0-5):");
		if (isNaN(rating) || rating < 0 || rating > 5) return alert("Invalid rating. Please enter a number between 0 and 5.");

		try {
			// Update book rating in MongoDB
			const rate = await api.patch(`/books/${book._id}`, { rating });
			alert(rate.data.message);
		} catch (err) {
			console.error(err);
			alert("Failed to rate: " + (err.response?.data?.message || err.message));
		}
	}

	const handleReturn = async () => {
		try {
			const returnBook = await api.put(`/reservations/return/`, { bookId });
			alert(returnBook.data.message);
			navigate(`/catalogue`);
		} catch (err) {
			console.error(err);
			alert("Failed to return: " + (err.response?.data?.message || err.message));
		}
	}

	if (!book || !user) return null;

	return (
		<div className="topratedGrid">
			<div className="coverBox">
				{book.image ? <img src={book.image} alt={book.title} /> : <i className="fa-regular fa-image" />}
			</div>

			<div className="infoArea">
				<p className="crumbs">
					<span style={{ cursor: "pointer" }} onClick={() => navigate(breadcrumb[0].to)}>
						{breadcrumb[0].label}
					</span>
					<span className="crumbsep">•</span>{" "}
					<span className="crumbtitle">{book.title}</span>
				</p>

				<h2 className="bookTitle">{book.title}</h2>

				<div className="metaRow">
					<span className="pill">{book.categoryId.name}</span>
					<span className="authorText">by {book.author}</span>
				</div>

				<div className="ratingRow">
					<StarRating value={book.rating || 0} disabled />
				</div>

				<h3 className="sectionTitle">Description</h3>
				<p className="descText">{book.description}</p>

				<div className="actionRow">
					{book.userInWaitlist && <button className="reserveBtn" onClick={handleWithdraw}>Withdraw from Waitlist</button>}
					{alreadyReserved && <>
						<button className="reserveBtn" onClick={handleReturn}>Return</button>
						<button className="reserveBtn" onClick={handleRate}>Rate</button>
						<p className="smallNote">Book reserved till {new Date(book.dueDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}</p>
					</>}
					{!alreadyReserved && !book.userInWaitlist &&
						<>
							<button className="reserveBtn" onClick={handleReserve}>Add to Reservation</button>
							{book.waitlistCount <= 0 && !book.reservedByOthers ?
								<span className="pill">Book is Available</span> :
								<span className="pill">Reserved · {book.waitlistCount} in waitlist</span>
							}
						</>
					}
					{!alreadyReserved && book.userInWaitlist && <p className="smallNote">Book already waitlisted</p>}
				</div>
			</div>
		</div>
	);
}
