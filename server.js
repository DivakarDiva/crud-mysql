
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || " ",
    database: process.env.DB_NAME || "crud_db",
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("MySQL connected successfully");
    connection.release();
});

// CREATE
app.post("/api/users", (req, res) => {
    const { name, email, age } = req.body;

    const sql =
        "INSERT INTO users (name, email, age) VALUES (?, ?, ?)";

    db.query(sql, [name, email, age], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database operation failed" });
        }

        res.status(201).json({
            message: "User added",
            id: result.insertId
        });
    });
});

// READ
app.get("/api/users", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database operation failed" });
        }

        res.json(results);
    });
});

// UPDATE
app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, age } = req.body;

    const sql =
        "UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?";

    db.query(sql, [name, email, age, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database operation failed" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User updated" });
    });
});

// DELETE
app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;

    db.query(
        "DELETE FROM users WHERE id = ?",
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Database operation failed" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({ message: "User deleted" });
        }
    );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
