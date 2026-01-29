import jsonwebtoken from "jsonwebtoken";

// Middleware to check if user is authenticated
const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token is not valid" });
        req.user = user;
        next();
    });
};

export default checkAuth;