const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => res.send('Admin Management Server is Running'));

const getFilePath = (file) => path.join(__dirname, 'data', file);

const readJSON = (file) => {
    try {
        return JSON.parse(fs.readFileSync(getFilePath(file), 'utf8'));
    } catch (e) {
        return [];
    }
};

const writeJSON = (file, data) =>
    fs.writeFileSync(getFilePath(file), JSON.stringify(data, null, 2));

const setupCRUDRoutes = (resource, filename) => {
    app.get(`/api/${resource}`, (req, res) => {
        res.json(readJSON(filename));
    });

    app.post(`/api/${resource}`, (req, res) => {
        const data = readJSON(filename);
        const newItem = { id: Date.now().toString(), ...req.body };
        data.push(newItem);
        writeJSON(filename, data);
        res.json(newItem);
    });

    app.put(`/api/${resource}/:id`, (req, res) => {
        const data = readJSON(filename);
        const index = data.findIndex((item) => item.id === req.params.id);
        if (index !== -1) {
            data[index] = { ...data[index], ...req.body };
            writeJSON(filename, data);
            res.json(data[index]);
        } else {
            res.status(404).json({ error: `${resource} not found` });
        }
    });

    app.delete(`/api/${resource}/:id`, (req, res) => {
        let data = readJSON(filename);
        data = data.filter((item) => item.id !== req.params.id);
        writeJSON(filename, data);
        res.json({ message: `${resource} deleted` });
    });
};

// Setup CRUD routes
setupCRUDRoutes('patients', 'patients.json');
setupCRUDRoutes('doctors', 'doctors.json');
setupCRUDRoutes('services', 'services.json');
setupCRUDRoutes('medicines', 'medicines.json');

// Finances (separate route)
app.get('/api/finances', (req, res) => {
    res.json(readJSON('finances.json'));
});

// Billing PDF Generator
app.post('/api/generate-bill', (req, res) => {
    try {
        const data = req.body;
        const doc = new PDFDocument({ margin: 50 });
        const filename = `invoice_${Date.now()}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        doc.pipe(res);

        const pageWidth = doc.page.width;
        const logoPath = path.join(__dirname, 'public', 'logo.png');

        doc.rect(0, 0, pageWidth, 60).fill('#E0F7FA');

        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 20, 10, { width: 40, height: 40 });
        }

        doc.fillColor('#00695C').fontSize(20).text('Sadri Clinic', 70, 20);

        doc.moveDown().fontSize(12).fillColor('black');
        doc.text(`Patient: ${data.patient}`);
        doc.text(`Doctor: ${data.doctor}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);

        doc.moveDown().text("Items:");
        data.items.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.name} - Rs. ${item.amount}`);
        });

        const total = data.items.reduce((sum, item) => sum + Number(item.amount), 0);
        doc.moveDown().text(`Total Amount: Rs. ${total}`);
        doc.text("Thank you for visiting Sadri Clinic!");

        doc.end();
    } catch (err) {
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
