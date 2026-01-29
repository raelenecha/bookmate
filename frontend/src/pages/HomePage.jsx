import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";

import BookCard from "../components/BookCard";
import api from "../components/Request.js";
import Scrollable from "../components/Scrollable.jsx";
import { useAuth } from "../components/UserAuth.jsx";

import "../styles/HomePage.scss";

function Home() {
	const navigate = useNavigate();
	const { user, loading } = useAuth();
	const { setHeaderProps } = useOutletContext();
	const [waitlistedBooks, setWaitlistedBooks] = useState([]);
	const [reservedBooks, setReservedBooks] = useState([]);

	useEffect(() => {
		if (loading) return;
		if (!user) return navigate("/login");
		setHeaderProps({ showBookCatalogue: true });
		document.title = "Bookmate | Home";
		let isMounted = true;

		const fetchData = async () => {
			try {
				const waitlistedList = await api.get("/reservations/waitlist");
				if (isMounted) setWaitlistedBooks(waitlistedList.data);

				const reservedList = await api.get("/reservations/reserved");
				if (isMounted) setReservedBooks(reservedList.data);
			} catch (err) {
				console.error("Home fetch error:", err);
			}
		};

		fetchData();
		return () => isMounted = false;
	}, [user, loading]);

	if (loading) return;

	return (
		<>
			<Scrollable></Scrollable>

			{waitlistedBooks.length !== 0 && <section className="waitlist_panel">
				<h2 className="panel__title">
					<i className="fas fa-clock"></i>
					We know you're waiting for
				</h2>

				<div className="stack">
					{waitlistedBooks.map((b) => (
						<BookCard
							key={`waitlist-${b.bookId._id}`}
							title={b.bookId.title}
							category={b.bookId.categoryId.name}
							author={b.bookId.author}
							variant="pill"
							image={b.bookId.image}
							waitlist={b.waitlistCount}
						>
							<button className="card__btn" onClick={() => navigate(`/book/${b.bookId._id}`, { state: { breadcrumb: [{ label: "Home", to: "/home" }] } })}>
								<i className="fas fa-arrow-up-right-from-square"></i>{" "}
								View
							</button>
						</BookCard>
					))}
				</div>
			</section>}

			{reservedBooks.length !== 0 && <section className="waitlist_panel">
				<h2 className="panel__title">
					<i className="fas fa-book"></i>
					You have reserved
				</h2>

				<div className="stack">
					{reservedBooks.map((b) => (
						<BookCard
							key={`reserved-${b._id}`}
							title={b.title}
							category={b.categoryId.name}
							author={b.author}
							variant="pill"
							image={b.image}
							waitlist={-1}
							dueDate={`Due ${new Date(b.dueDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}`}
						>
							<button className="card__btn" onClick={() => navigate(`/book/${b._id}`, { state: { breadcrumb: [{ label: "Home", to: "/home" }] } })}>
								<i className="fas fa-arrow-up-right-from-square"></i>{" "}
								View
							</button>
						</BookCard>
					))}
				</div>
			</section>}

			<div className="overview__actions">
				<Link to="/catalogue" className="overview__btn">
					Browse Catalogue
				</Link>

				<Link to="/account" className="overview__btn">
					My Account
				</Link>

				<Link to="/rewards" className="overview__btn">
					My Rewards
				</Link>
			</div>
		</>
	);
}

export default Home;
