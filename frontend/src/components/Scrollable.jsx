import { Fragment, useEffect, useState } from 'react';
import '../styles/Scrollable.scss';
import api from './Request.js';
import StarRating from './StarRating.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './UserAuth';

const Scrollable = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedIndex, setSelectedIndex] = useState(1);
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await api.get('/books/top-rated');
                setBooks(response.data);
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        }

        fetchBooks();
    }, []);

    useEffect(() => {
        if (books.length === 0) return;

        const interval = setInterval(() => {
            setSelectedIndex(prev =>
                prev === books.length ? 1 : prev + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [books.length]);

    return (
        <div className="scrollable_container">
            <h2>
                <i className="fas fa-heart"></i>
                Hi {user?.name}! Check out these top rated books
            </h2>

            <div className="scrollable_list" style={{ transform: `translateX(${-(selectedIndex - 1) * 100}vw)` }}>
                {books.map((book, idx) => (
                    <div
                        key={book._id}
                        className={`scrollable_item ${idx + 1 === selectedIndex ? 'active' : ''}`}
                    >
                        <img src={book.image} alt={book.title} />
                        <div className="scrollable_item_info">
                            <h3>{book.title}</h3>
                            <p>{book.author}</p>
                            <span>
                                <i className="fas fa-tags"></i>{" "}
                                {book.categoryId.name}
                            </span>
                            <StarRating value={book.rating} disabled></StarRating>

                            <p>{book.description}</p>

                            <button className="scrollable_item_button" onClick={() => navigate(`/book/${book._id}`, { state: { breadcrumb: [{ label: "Home", to: "/home" }] } })}>
                                <i className="fas fa-arrow-up-right-from-square"></i>{" "}
                                View
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="scrollable_selector">
                {Array.from({ length: 3 }).map((_, idx) => (
                    <Fragment key={`scrollable-${idx}`}>
                        <input type="radio" name="scrollable" id={`scrollable-${idx + 1}`} checked={selectedIndex === idx + 1} onChange={() => setSelectedIndex(idx + 1)} />
                        <label htmlFor={`scrollable-${idx + 1}`}></label>
                    </Fragment>
                ))}
            </div>
        </div>
    )
};

export default Scrollable;