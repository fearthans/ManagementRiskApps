const express = require("express");
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Add this line to parse JSON

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
app.get('/risks', (req, res) => {
    const sql = "SELECT * FROM risks";
    db.query(sql, (err, data) => {
        if (err) return res.json(err); // Ganti Return dengan return
        return res.json(data);
    });
});

// Tambah risiko baru
app.post('/risks', (req, res) => {
    const { id, name, description, owner, control, probability, impact, riskLevel } = req.body;
    const sql = `INSERT INTO risks (id, name, description, owner, control, probability, impact, riskLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [id, name, description, owner, control, probability, impact, riskLevel], (err, result) => {
        if (err) return res.status(500).json(err); // Return an error response
        return res.json("Risk Added Successfully");
    });
});

// Update risiko yang ada
app.put('/risks/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, owner, control, probability, impact, riskLevel } = req.body;
    const sql = `UPDATE risks SET name = ?, description = ?, owner = ?, control = ?, probability = ?, impact = ?, riskLevel = ? WHERE id = ?`;
    db.query(sql, [name, description, owner, control, probability, impact, riskLevel, id], (err, result) => {
        if (err) return res.json(err);
        return res.json("Risk Updated Successfully");
    });
});

// Hapus risiko
app.delete('/risks/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM risks WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.json(err);
        return res.json("Risk Deleted Successfully");
    });
});

// Route untuk mengambil data dari tabel `risks`
// app.get('/data-users', (req, res) => {
//     const sql = "SELECT * FROM risks";
//     db.query(sql, (err, data) => {
//         if (err) {
//             console.error(err); // Tampilkan error jika ada di console
//             return res.json(err);
//         }
        
//         console.log(data); // Menampilkan data JSON di console
//         return res.json(data); // Mengirim data sebagai response JSON ke frontend
//     });
// });

// Menjalankan server di port 8081
app.listen(8081, () => {
    console.log("Server is listening on port 8081");
});

