import { useOutletContext, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../components/UserAuth";
import api from "../components/Request";

const BookCreate = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const { setHeaderProps } = useOutletContext();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (loading) return;
        if (!user || user?.role !== "admin") return navigate("/home");
        document.title = "Bookmate | Create Book";
        setHeaderProps({ showHome: true, showBack: true });

        const fetchData = async () => {
            const categories = await api.get("/books/categories");
            setCategories(categories.data);
        };

        fetchData();
    }, [user, setHeaderProps, navigate, loading]);

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (!e.target.checkValidity()) return alert('Please fill in all fields');

            const form = new FormData(e.target);
            const res = await api.post("/books", form);
            alert(res.data.message);
            navigate("/catalogue");
        } catch (err) {
            console.error(err);
            if (err.response?.data?.message.includes("E11000")) return alert("Book already exists")
            alert("Create failed: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return;

    return (
        <form onSubmit={handleSubmit} className='login'>
            <h2>Create Book</h2>

            <label htmlFor="title">Title:</label>
            <input id="title" name="title" placeholder='Enter Book Title' type="text" required />

            <label htmlFor="author">Author:</label>
            <input id="author" name="author" placeholder='Enter Book Author' type="text" required />

            <label htmlFor="category">Category:</label>
            <select name="categoryId" id="category" defaultValue="" required>
                <option value="" disabled hidden>Select Category</option>
                {categories.map((category) => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                ))}
            </select>

            <label htmlFor="description">Description:</label>
            <textarea name="description" id="description" placeholder='Enter Book Description' required></textarea>

            <label htmlFor="image">Image Path:</label>
            <input id="image" name="image" placeholder='Enter Book Image URL' type="text" required />

            <button>Create</button>
        </form>
    )
};

export default BookCreate;