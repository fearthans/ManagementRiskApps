const express = require("express");
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());

// Membuat koneksi ke database MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: '',
    database: 'tugas'
});

// Route untuk memeriksa server
app.get('/', (req, res) => {
    return res.json("From Backend Side");
});

// Route untuk mengambil data dari tabel `tugas`
app.get('/users', (req, res) => {
    const sql = "SELECT * FROM risks";
    db.query(sql, (err, data) => {
        if (err) return res.json(err); // Ganti Return dengan return
        return res.json(data);
    });
});

// Menjalankan server di port 8081
app.listen(8081, () => {
    console.log("Server is listening on port 8081");
});

