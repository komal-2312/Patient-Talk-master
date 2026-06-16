const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const { connectDB } = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const logoRoutes = require("./src/routes/logoRoutes");
const UserRouter = require("./src/routes/userRoutes");


const adminRoutes = require("./src/routes/adminRoutes");
const superAdminRoutes = require("./src/routes/superAdminRoutes");
const { notFoundHandler, errorHandler } = require("./src/middleware/errorHandler");
const cookieParser = require("cookie-parser");


const app = express();
const path = require("path");

const contactPersonRoutes = require("./src/routes/contactPersonRoutes");


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use(
  cors({
    origin: "http://localhost:5173", // Update this to your frontend URL ,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(cookieParser()); // coookie parser for JWT in cookies
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "backend", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/logo", logoRoutes);
app.use("/api/user", UserRouter);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/contact", contactPersonRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", err);
    process.exit(1);
  });

