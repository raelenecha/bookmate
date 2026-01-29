import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../components/UserAuth";
import api from "../components/Request";

const BookEdit = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const { bookId } = useParams();
    const { setHeaderProps } = useOutletContext();
    const [book, setBook] = useState({});
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (loading) return;
        if (!user || user.role !== "admin") return navigate("/login");
        document.title = "Bookmate | Edit Book";
        setHeaderProps({ showHome: true, showBack: true });

        const fetchData = async () => {
            const book = await api.get(`/books/${bookId}`);
            setBook(book.data);

            const categories = await api.get('/books/categories');
            setCategories(categories.data);
        };

        fetchData();
    }, [loading, user, bookId, navigate, setHeaderProps]);

    const handleUpdate = async (e) => {
        try {
            e.preventDefault();
            if (!e.target.checkValidity()) return alert('Please fill in all fields');

            const form = new FormData(e.target);
            form.append("bookId", bookId);
            const res = await api.put("/books", form);
            alert(res.data.message);
            navigate("/catalogue");
        } catch (err) {
            console.error(err);
            if (err.response?.data?.message.includes("E11000")) return alert("Book already exists")
            alert("Update failed: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this book?")) {
            try {
                const deleteBook = await api.delete(`/books/${bookId}`);
                alert(deleteBook.data.message);
                navigate("/catalogue");
            } catch (err) {
                console.error(err);
                alert("Delete failed: " + (err.response?.data?.message || err.message));
            }
        }
    }

    if (loading) return;

    return (
        <form onSubmit={handleUpdate} className='login'>
            <h2>Edit Book</h2>

            <label htmlFor="title">Title:</label>
            <input id="title" name="title" placeholder='Enter Book Title' defaultValue={book.title} type="text" required />

            <label htmlFor="author">Author:</label>
            <input id="author" name="author" placeholder='Enter Book Author' defaultValue={book.author} type="text" required />

            <label htmlFor="category">Category:</label>
            <select name="categoryId" id="category" defaultValue={book.categoryId} required>
                <option value="" disabled hidden>Select Category</option>
                {categories.map((category) => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                ))}
            </select>

            <label htmlFor="description">Description:</label>
            <textarea name="description" defaultValue={book.description} id="description" placeholder='Enter Book Description' required></textarea>

            <label htmlFor="image">Image Path:</label>
            <input id="image" name="image" defaultValue={book.image} placeholder='Enter Book Image URL' type="text" required />

            <div className="buttons">
                <button>Update</button>
                <button type="button" onClick={handleDelete}>Delete</button>
            </div>
        </form>
    )
};

export default BookEdit;