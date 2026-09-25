require('dotenv').config();

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024, files: 10 }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/warehouse.html', (req, res) => res.sendFile(path.join(__dirname, 'warehouse.html')));
app.get('/style.css', (req, res) => res.sendFile(path.join(__dirname, 'style.css')));

app.post('/submit', upload.array('attachments', 10), async (req, res, next) => {
    const { vendorName, location, latitude, longitude, contact, itemName, deadline, feedback } = req.body;
    const files = req.files || [];

    try {
        const attachments = files.map(file => ({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size
        }));

        const result = await pool.query(
            `INSERT INTO dispatch_requests
                (vendor_name, location, latitude, longitude, contact, item_name, deadline, feedback, attachments)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, submitted_at`,
            [
                vendorName,
                location,
                latitude ? Number(latitude) : null,
                longitude ? Number(longitude) : null,
                contact,
                itemName,
                deadline,
                feedback || null,
                JSON.stringify(attachments)
            ]
        );

        res.status(201).json({ success: true, ...result.rows[0] });
    } catch (error) {
        await Promise.all(files.map(file => fs.promises.unlink(file.path).catch(() => {})));
        next(error);
    }
});

app.use((err, req, res, next) => {
    console.error('Request failed:', err.message);
    const status = err instanceof multer.MulterError ? 400 : 500;
    res.status(status).json({
        success: false,
        message: status === 400 ? err.message : 'Could not save the form. Check the server and database settings.'
    });
});

pool.query('SELECT 1')
    .then(() => {
        app.listen(PORT, () => console.log(`Form server ready at http://localhost:${PORT}`));
    })
    .catch(error => {
        console.error('Could not connect to PostgreSQL:', error.message);
        process.exit(1);
    });
