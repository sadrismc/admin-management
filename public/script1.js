//dashboard
const apiURL = "http://localhost:3000"; // ✔️ NO trailing /api

const fetchJson = async(url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url} — Status: ${res.status}`);
    return res.json();
};

if (document.getElementById("totalPatients")) {
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    const loadDashboard = async() => {
        try {
            const [patients, doctors, medicines, services, finances] = await Promise.all([
                fetchJson(`${apiURL}/api/patients`),
                fetchJson(`${apiURL}/api/doctors`),
                fetchJson(`${apiURL}/api/medicines`),
                fetchJson(`${apiURL}/api/services`),
                fetchJson(`${apiURL}/api/finances`)
                // appointments removed since you skipped that feature
            ]);

            setText("totalPatients", patients.length);
            setText("totalDoctors", doctors.length);
            setText("totalMedicines", medicines.length);
            setText("totalServices", services.length);

            const earnings = finances.filter(f => f.type === "earning");
            const expenses = finances.filter(f => f.type === "expense");

            const sum = arr => arr.reduce((acc, x) => acc + Number(x.amount), 0);

            const totalEarnings = sum(earnings);
            const totalExpenses = sum(expenses);
            const profit = totalEarnings - totalExpenses;

            setText("totalEarnings", `PKR ${totalEarnings}`);
            setText("totalExpenses", `PKR ${totalExpenses}`);
            setText("netProfit", `PKR ${profit}`);

            // Optional appointments section removed

        } catch (err) {
            console.error("🚨 Dashboard load failed:", err);
            alert("Failed to load dashboard data. Check console.");
        }
    };

    loadDashboard();
}