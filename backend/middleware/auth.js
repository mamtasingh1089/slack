import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    req.userId = decoded.id;

    next();
  } catch (error) {
    console.log("JWT Error:", error.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default auth;