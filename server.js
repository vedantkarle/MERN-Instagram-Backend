const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const cors = require("cors");
const app = express();
dotenv.config();

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("DB connected...");
});

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const userRoutes = require("./routes/user");

app.get("/", (req, res) => {
  res.send("Home");
});

app.use("/api", authRoutes);
app.use("/api", postRoutes);
app.use("/api", userRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log("Listening in port", port));
