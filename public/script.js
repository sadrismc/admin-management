// ==================== GLOBAL HELPERS ====================
const apiURL = "http://localhost:3000/api";

const createTagList = (items) =>
    items.map(item => `<span class="tag">${item}</span>`).join("");

// ==================== PATIENT FORM ====================
if (document.getElementById("patientForm")) {
    const form = document.getElementById("patientForm");
    const list = document.getElementById("patientList");
    const searchInput = document.getElementById("searchPatient");

    let patients = [];

    const loadPatients = async() => {
        const res = await fetch(`${apiURL}/patients`);
        patients = await res.json();
        renderPatients(patients);
    };

    const renderPatients = (data) => {
        list.innerHTML = data.map(p => `
      <div class="card-grid">
      <div class="card" data-id="${p.id}">
        <h3>${p.name} (${p.age})</h3>
        <p><strong>Phone Number:</strong> ${p.phone}</p>
        <p><strong>Doctor:</strong> ${p.doctor}</p>
        <p><strong>Services:</strong> ${createTagList(p.services || [])}</p>
        <p><strong>Medicines:</strong> ${createTagList(p.medicines || [])}</p>
        <button onclick="editPatient('${p.id}')">✏️ Edit</button>
        <button onclick="deletePatient('${p.id}')">🗑️ Delete</button>
      </div>
      </div>
    `).join("");
    };

    form.onsubmit = async(e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const id = formData.get("id");
        const newPatient = {
            name: formData.get("name"),
            age: parseInt(formData.get("age")),
            phone: parseInt(formData.get("phone")),
            doctor: formData.get("doctor"),
            services: formData.get("services").split(",").map(x => x.trim()),
            medicines: formData.get("medicines").split(",").map(x => x.trim())
        };

        if (id) {
            // Update
            await fetch(`${apiURL}/patients/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPatient)
            });
        } else {
            // Create
            await fetch(`${apiURL}/patients`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPatient)
            });
        }

        form.reset();
        form.querySelector("input[name='id']").value = "";
        loadPatients();
    };

    window.editPatient = async(id) => {
        const p = patients.find(p => p.id === id);
        form.querySelector("input[name='id']").value = p.id;
        form.querySelector("input[name='name']").value = p.name;
        form.querySelector("input[name='age']").value = p.age;
        form.querySelector("input[name='phone']").value = p.phone;
        form.querySelector("input[name='doctor']").value = p.doctor;
        form.querySelector("input[name='services']").value = (p.services || []).join(", ");
        form.querySelector("input[name='medicines']").value = (p.medicines || []).join(", ");
        form.scrollIntoView({ behavior: 'smooth' });
    };

    window.deletePatient = async(id) => {
        if (confirm("Delete this patient?")) {
            await fetch(`${apiURL}/patients/${id}`, { method: "DELETE" });
            loadPatients();
        }
    };

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const filtered = patients.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.doctor.toLowerCase().includes(query) ||
            (p.services || []).some(s => s.toLowerCase().includes(query)) ||
            (p.medicines || []).some(m => m.toLowerCase().includes(query))
        );
        renderPatients(filtered);
    });

    loadPatients();
}


// ==================== DOCTOR FORM ====================
if (document.getElementById("doctorForm")) {
    const form = document.getElementById("doctorForm");
    const list = document.getElementById("doctorList");
    const searchInput = document.getElementById("searchDoctor");
    let doctors = [];

    const loadDoctors = async() => {
        const res = await fetch(`${apiURL}/doctors`);
        doctors = await res.json();
        renderDoctors(doctors);
    };

    const renderDoctors = (data) => {
        list.innerHTML = data.map(d => `
      <div class="card" data-id="${d.id}">
        <h3>${d.name}</h3>
        <p>${d.specialty}</p>
        <button onclick="editDoctor('${d.id}')">✏️ Edit</button>
        <button onclick="deleteDoctor('${d.id}')">🗑️ Delete</button>
      </div>
    `).join("");
    };

    form.onsubmit = async(e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const id = formData.get("id");
        const payload = {
            name: formData.get("name"),
            specialty: formData.get("specialty")
        };

        if (id) {
            await fetch(`${apiURL}/doctors/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } else {
            await fetch(`${apiURL}/doctors`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }

        form.reset();
        loadDoctors();
    };

    window.editDoctor = (id) => {
        const d = doctors.find(doc => doc.id === id);
        form.querySelector("input[name='id']").value = d.id;
        form.querySelector("input[name='name']").value = d.name;
        form.querySelector("input[name='specialty']").value = d.specialty;
    };

    window.deleteDoctor = async(id) => {
        if (confirm("Delete this doctor?")) {
            await fetch(`${apiURL}/doctors/${id}`, { method: "DELETE" });
            loadDoctors();
        }
    };

    searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase();
        const filtered = doctors.filter(d =>
            d.name.toLowerCase().includes(q) ||
            (d.specialty || "").toLowerCase().includes(q)
        );
        renderDoctors(filtered);
    });

    loadDoctors();
}


// ==================== SERVICE FORM ====================
if (document.getElementById("serviceForm")) {
    const form = document.getElementById("serviceForm");
    const list = document.getElementById("serviceList");
    const searchInput = document.getElementById("searchService");
    let services = [];

    const loadServices = async() => {
        const res = await fetch(`${apiURL}/services`);
        services = await res.json();
        renderServices(services);
    };

    const renderServices = (data) => {
        list.innerHTML = data.map(s => `
      <div class="card" data-id="${s.id}">
        <h3>${s.name}</h3>
        <p>PKR ${s.price}</p>
        <p>Category: ${s.category || 'N/A'}</p>
        <button onclick="editService('${s.id}')">✏️ Edit</button>
        <button onclick="deleteService('${s.id}')">🗑️ Delete</button>
      </div>
    `).join("");
    };

    form.onsubmit = async(e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const id = formData.get("id");
        const payload = {
            name: formData.get("name"),
            price: parseFloat(formData.get("price")),
            category: formData.get("category")
        };

        if (id) {
            await fetch(`${apiURL}/services/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } else {
            await fetch(`${apiURL}/services`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }

        form.reset();
        loadServices();
    };

    window.editService = (id) => {
        const s = services.find(x => x.id === id);
        form.querySelector("input[name='id']").value = s.id;
        form.querySelector("input[name='name']").value = s.name;
        form.querySelector("input[name='price']").value = s.price;
        form.querySelector("input[name='category']").value = s.category || '';
    };

    window.deleteService = async(id) => {
        if (confirm("Delete this service?")) {
            await fetch(`${apiURL}/services/${id}`, { method: "DELETE" });
            loadServices();
        }
    };

    searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase();
        const filtered = services.filter(s =>
            s.name.toLowerCase().includes(q) ||
            (s.category || "").toLowerCase().includes(q)
        );
        renderServices(filtered);
    });

    loadServices();
}


// ==================== MEDICINE FORM ====================
if (document.getElementById("medicineForm")) {
    const form = document.getElementById("medicineForm");
    const list = document.getElementById("medicineList");
    const searchInput = document.getElementById("searchMedicine");
    let meds = [];

    const loadMedicines = async() => {
        const res = await fetch(`${apiURL}/medicines`);
        meds = await res.json();
        renderMedicines(meds);
    };

    const renderMedicines = (data) => {
        list.innerHTML = data.map(m => `
      <div class="card" data-id="${m.id}">
        <h3>${m.name}</h3>
        <p>PKR ${m.price}</p>
        <p>Category: ${m.category || 'N/A'}</p>
        <button onclick="editMedicine('${m.id}')">✏️ Edit</button>
        <button onclick="deleteMedicine('${m.id}')">🗑️ Delete</button>
      </div>
    `).join("");
    };

    form.onsubmit = async(e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const id = formData.get("id");
        const payload = {
            name: formData.get("name"),
            price: parseFloat(formData.get("price")),
            category: formData.get("category")
        };

        if (id) {
            await fetch(`${apiURL}/medicines/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } else {
            await fetch(`${apiURL}/medicines`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }

        form.reset();
        loadMedicines();
    };

    window.editMedicine = (id) => {
        const m = meds.find(x => x.id === id);
        form.querySelector("input[name='id']").value = m.id;
        form.querySelector("input[name='name']").value = m.name;
        form.querySelector("input[name='price']").value = m.price;
        form.querySelector("input[name='category']").value = m.category || '';
    };

    window.deleteMedicine = async(id) => {
        if (confirm("Delete this medicine?")) {
            await fetch(`${apiURL}/medicines/${id}`, { method: "DELETE" });
            loadMedicines();
        }
    };

    searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase();
        const filtered = meds.filter(m =>
            m.name.toLowerCase().includes(q) ||
            (m.category || "").toLowerCase().includes(q)
        );
        renderMedicines(filtered);
    });

    loadMedicines();
}


// ==================== BILLING FORM ====================
if (document.getElementById("billingForm")) {
    const form = document.getElementById("billingForm");

    form.onsubmit = async(e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const rawItems = formData.get("items").split(",");
        const items = rawItems.map(item => {
            const [name, price, type] = item.split(":");
            return { name, price: parseFloat(price), type };
        });

        const payload = {
            patient: formData.get("patient"),
            doctor: formData.get("doctor"),
            items,
            total: parseFloat(formData.get("total").replace(/[^\d.]/g, ''))
        };

        const res = await fetch(`${apiURL}/generate-bill`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice_${Date.now()}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    };
}

// ==================== REPORTS ====================
if (document.querySelector(".report-section")) {
    const showReports = async() => {
        const res = await fetch(`${apiURL}/finances`);
        const data = await res.json();

        const now = new Date();

        const isSameDay = (d1, d2) =>
            d1.toDateString() === d2.toDateString();
        const isSameWeek = (d1, d2) => {
            const first = d1.getDate() - d1.getDay();
            const last = first + 6;
            return d2.getDate() >= first && d2.getDate() <= last;
        };
        const isSameMonth = (d1, d2) =>
            d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
        const isSameYear = (d1, d2) => d1.getFullYear() === d2.getFullYear();

        const sum = (items) =>
            items.reduce((acc, item) =>
                item.type === "earning" ? acc + item.amount : acc - item.amount, 0);

        const today = sum(data.filter(entry => isSameDay(now, new Date(entry.date))));
        const week = sum(data.filter(entry => isSameWeek(now, new Date(entry.date))));
        const month = sum(data.filter(entry => isSameMonth(now, new Date(entry.date))));
        const year = sum(data.filter(entry => isSameYear(now, new Date(entry.date))));

        document.querySelector(".report-section").innerHTML = `
      <p><strong>Today:</strong> PKR ${today}</p>
      <p><strong>This Week:</strong> PKR ${week}</p>
      <p><strong>This Month:</strong> PKR ${month}</p>
      <p><strong>This Year:</strong> PKR ${year}</p>`;
    };

    showReports();
}

//History

if (document.getElementById("historyList")) {
    const list = document.getElementById("historyList");
    const searchInput = document.getElementById("historySearch");
    let history = [];

    const loadHistory = async() => {
        const res = await fetch(`${apiURL}/patients`);
        history = await res.json();
        renderHistory(history);
    };

    const renderHistory = (data) => {
        list.innerHTML = data.map(p => `
      <div class="card-grid">
        <div class="card">
        <h3>${p.name} (${p.age})</h3>
        <p><strong>Phone:</strong> ${p.phone}</p>
        <p><strong>Doctor:</strong> ${p.doctor}</p>
        <p><strong>Services:</strong> ${createTagList(p.services)}</p>
        <p><strong>Medicines:</strong> ${createTagList(p.medicines)}</p>
      </div>
    `).join("");
    };

    searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase();
        const filtered = history.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.doctor.toLowerCase().includes(q) ||
            (p.services || []).some(s => s.toLowerCase().includes(q)) ||
            (p.medicines || []).some(m => m.toLowerCase().includes(q)) ||
            (p.date || "").toLowerCase().includes(q)
        );
        renderHistory(filtered);
    });

    window.exportHistoryPDF = () => {
        const docWindow = window.open("", "_blank");
        const logo = `<div style="text-align:center;"><img src="logo.png" width="100"/></div>`;
        const heading = `<h2 style="text-align:center;">Patient History Report</h2>`;
        const rows = history.map(p => `
      <div style="margin-bottom:15px;border-bottom:1px solid #ccc;padding-bottom:10px;">
        <strong>${p.name}</strong> (${p.age})<br/>
        <strong>Phone:</strong> ${p.phone}<br/>
        <strong>Doctor:</strong> ${p.doctor}<br/>
        <strong>Services:</strong> ${p.services.join(", ")}<br/>
        <strong>Medicines:</strong> ${p.medicines.join(", ")}<br/>
      </div>
    `).join("");

        const thanks = `<p style="text-align:center;margin-top:30px;">End...</p>`;

        docWindow.document.write(`
      <html><head><title>Patient History</title></head><body>
      ${logo}
      ${heading}
      ${rows}
      ${thanks}
      </body></html>
    `);
        docWindow.document.close();
        docWindow.print();
    };

    loadHistory();
}


//Finance
if (document.getElementById("financeReport")) {
    const fromInput = document.getElementById("fromDate");
    const toInput = document.getElementById("toDate");
    const output = document.getElementById("financeReport");
    let finances = [];

    const loadFinances = async() => {
        const res = await fetch(`${apiURL}/finances`);
        finances = await res.json();
        renderFinance(finances);
    };

    const renderFinance = (data) => {
        const earnings = data.filter(f => f.type === "earning");
        const expenses = data.filter(f => f.type === "expense");

        const sum = arr => arr.reduce((acc, x) => acc + Number(x.amount), 0);

        const totalEarnings = sum(earnings);
        const totalExpenses = sum(expenses);
        const net = totalEarnings - totalExpenses;

        output.innerHTML = `
      <h3>Summary</h3>
      <p><strong>Total Earnings:</strong> PKR ${totalEarnings}</p>
      <p><strong>Total Expenses:</strong> PKR ${totalExpenses}</p>
      <p><strong>Net Profit:</strong> PKR ${net}</p>

      <h4>Breakdown</h4>
      <p>Services Income: PKR ${sum(earnings.filter(e => e.category === "service"))}</p>
      <p>Medicines Income: PKR ${sum(earnings.filter(e => e.category === "medicine"))}</p>
      <p>Stock Expense: PKR ${sum(expenses.filter(e => e.category === "stock"))}</p>
      <p>Salary Expense: PKR ${sum(expenses.filter(e => e.category === "salary"))}</p>
    `;
    };

    window.filterFinance = () => {
        const from = new Date(fromInput.value);
        const to = new Date(toInput.value);
        const filtered = finances.filter(f => {
            const d = new Date(f.date);
            return d >= from && d <= to;
        });
        renderFinance(filtered);
    };

    window.exportFinancePDF = () => {
        const html = output.innerHTML;
        const doc = window.open("", "_blank");
        doc.document.write(`
      <html><head><title>Finance Report</title></head><body>
      <h2 style="text-align:center;">Clinic Finance Summary</h2>
      ${html}
      <p style="text-align:center;margin-top:30px;">Thanks for managing your clinic professionally 🧾</p>
      </body></html>
    `);
        doc.document.close();
        doc.print();
    };

    loadFinances();
}