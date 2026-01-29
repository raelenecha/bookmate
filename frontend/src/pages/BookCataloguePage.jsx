import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { useAuth } from "../components/UserAuth.jsx";
import BookCard from "../components/BookCard.jsx";
import api from "../components/Request.js";
import "../styles/BookCataloguePage.scss";

export default function BookCataloguePage() {
	const navigate = useNavigate();
	const { user, loading } = useAuth();
	const { setHeaderProps } = useOutletContext();
	const [searchParams, setSearchParams] = useSearchParams();
	const [query, setQuery] = useState(() => {
		return searchParams.get("search") || "";
	});
	const [books, setBooks] = useState([]);

	useEffect(() => {
		setSearchParams({ search: query ?? "" });
	}, [query]);

	// Initial data load
	useEffect(() => {
		if (loading) return;
		if (!user) return navigate("/login");
		setHeaderProps({ showHome: true });
		document.title = "Bookmate | Book Catalogue";

		const load = async () => {
			try {
				const books = await api.get("/books");
				setBooks(books.data);
			} catch (err) {
				console.error("Catalogue load error:", err);
			}
		};

		load();
	}, [user, loading]);

	// Filter books based on search input
	const filteredBooks = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return books;

		return (books || []).filter((b) => {
			const title = String(b.title || "").toLowerCase();
			const author = String(b.author || "").toLowerCase();
			return title.includes(q) || author.includes(q);
		});
	}, [books, query]);

	if (loading) return;

	return (
		<div className="catalogueLayout">
			<div className="searchInputWrap">
				<i className="fas fa-magnifying-glass searchIcon"></i>
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search for a book or author"
					className="searchInput"
				/>
				{user?.role === 'admin' && <button onClick={() => navigate("/book/new")} className="addBookBtn">
					<i className="fas fa-plus"></i>
					Add Book
				</button>}
			</div>

			<div className="catalogueGrid">
				{filteredBooks.map((b, i) => (
					<BookCard
						key={b._id}
						title={b.title}
						category={b.categoryId.name}
						author={b.author}
						image={b.image}
						rating={b.rating || 0}
						waitlist={b.waitlistCount}
						style={{ animationDelay: i * 0.2 + "s" }}
						className="catalogueCard"
					>
						<button className="card__btn" onClick={() => navigate(`/book/${b._id}${user.role === "admin" ? "/edit" : ""}`, { state: { breadcrumb: [{ label: "Book Catalogue", to: "/catalogue" }] } })}>
							<i className={`fas fa-${user.role === "student" ? "arrow-up-right-from-square" : "edit"}`}></i>{" "}
							{user.role === "student" ? "View" : "Edit"}
						</button>
					</BookCard>
				))}
			</div>
		</div>
	);
}
