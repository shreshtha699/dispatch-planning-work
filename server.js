    const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Attachments is folder mein save honge
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, Date.now() + '-' + safeName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024, files: 10 } // 10 MB per file, max 10 files
});

// Serve only public front-end files; keep uploads and saved submissions private.
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/warehouse.html', (req, res) => res.sendFile(path.join(__dirname, 'warehouse.html')));
app.get('/style.css', (req, res) => res.sendFile(path.join(__dirname, 'style.css')));

// Form submit
app.post('/submit', upload.array('attachments', 10), (req, res) => {
    const entry = {
        id: Date.now(),
        vendorName: req.body.vendorName,
        location: req.body.location,
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null,
        contact: req.body.contact,
        itemName: req.body.itemName,
        deadline: req.body.deadline,
        feedback: req.body.feedback || '',
        files: req.files.map(f => f.filename),
        submittedAt: new Date().toISOString()
    };

    const dbFile = path.join(__dirname, 'data.json');
    let data = [];
    if (fs.existsSync(dbFile)) data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    data.push(entry);
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));

    console.log('Naya entry:', entry);
    res.json({ success: true });
});

// Error handling (file bahut badi ho ya 10 se zyada files)
app.use((err, req, res, next) => {
    res.status(400).json({ success: false, message: err.message });
});

app.listen(PORT, () => console.log(`Server chal raha hai: http://localhost:${PORT}`));
