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

// ---------- Utility Helpers ----------
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

// ---------- Generic CRUD Route Helper ----------
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
            data[index] = {...data[index], ...req.body };
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

// ---------- Setup Routes ----------
setupCRUDRoutes('patients', 'patients.json');
setupCRUDRoutes('doctors', 'doctors.json');
setupCRUDRoutes('services', 'services.json');
setupCRUDRoutes('medicines', 'medicines.json');

// ---------- Financial Reports ----------
app.get('/api/finances', (req, res) => {
    res.json(readJSON('finances.json'));
});

// ---------- Billing PDF Export ----------
app.post('/api/generate-bill', (req, res) => {
    const data = req.body;
    const doc = new PDFDocument({ margin: 50 });
    const filename = `invoice_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const logoPath = path.join(__dirname, 'public', 'logo.png');

    // ====== HEADER ======
    doc
        .rect(0, 0, pageWidth, 60)
        .fill('#E0F7FA');

    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 20, 10, { width: 40, height: 40 });
    }

    doc
        .fillColor('#00695C')
        .fontSize(20)
        .text('Sadri Health Services', 70, 20, {
            align: 'center'
        });

    doc
        .moveTo(0, 60)
        .lineTo(pageWidth, 60)
        .strokeColor('#B2DFDB')
        .stroke();

    doc.moveDown(3);

    // ====== WATERMARK ======
    if (fs.existsSync(logoPath)) {
        doc
            .opacity(0.08)
            .image(logoPath, pageWidth / 4, pageHeight / 4, {
                width: 300,
                height: 300
            })
            .opacity(1);
    }

    // ====== BILL DETAILS ======
    doc
        .fillColor('blue')
        .fontSize(18)
        .text('Invoice', { align: 'center' });

    doc.moveDown();
    doc.fillColor('black').fontSize(14);
    doc.text(`Patient: ${data.patient}`);
    doc.text(`Doctor: ${data.doctor}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    doc.moveDown().fontSize(16).fillColor('#333').text(' ', { underline: true });
    doc.moveDown(0.5);

    // Table Header
    const tableTop = doc.y;
    const itemX = 70;
    const typeX = 300;
    const priceX = 430;

    doc
        .fontSize(12)
        .fillColor('#00695C')
        .text('Services / Medicines', itemX, tableTop)
        .text('Price (PKR)', priceX, tableTop);

    // Divider Line
    doc
        .strokeColor('#ccc')
        .moveTo(itemX, doc.y + 2)
        .lineTo(540, doc.y + 2)
        .stroke();

    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('black');

    // Table Rows
    data.items.forEach(item => {
        const y = doc.y;
        doc.text(item.name, itemX, y);
        doc.text(item.type, typeX, y);
        doc.text(item.price, priceX, y);
        doc.moveDown();
    });

    // Total Amount
    doc
        .fillColor('green')
        .fontSize(14)
        .text(`Total: ${data.total} PKR`, { align: 'right' });


    // ====== FOOTER ======
    const footerY = doc.page.height - 110;

    doc
        .fillColor("#444")
        .fontSize(10)
        .text("Address: 13-14, 1st Floor, Capital Trade Center, F-10 Markaz, Islamabad, Pakistan", 50, footerY, {
            align: 'center',
            width: pageWidth - 100
        })
        .text("Phone: +92 333 6202688     Email: sadrismc@gmail.com", {
            align: 'center',
            width: pageWidth - 100
        })
        .fillColor("blue")
        .text("Website: www.sadri.info", {
            align: 'center',
            link: 'http://www.sadri.info',
            underline: true,
            width: pageWidth - 100
        });

    doc.end();

    // ====== SAVE FINANCIAL ENTRY ======
    const finances = readJSON('finances.json');
    finances.push({
        date: new Date().toISOString(),
        type: 'earning',
        amount: data.total
    });
    writeJSON('finances.json', finances);
});



app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
