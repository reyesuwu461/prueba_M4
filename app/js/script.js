// Transaction Management - CRUD

const API_URL = "http://localhost:3000/clients";
const tableTransactions = document.getElementById("tableTransactions");
const transactionForm = document.getElementById("transactionForm");

// Render static options for status
function renderStatusOptions() {
    const statusSelect = document.getElementById("status");
    statusSelect.innerHTML = `
        <option value="">Select Status</option>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
        <option value="Failed">Failed</option>
    `;
}

// Render static options for platform
function renderPlatformOptions() {
    const platformSelect = document.getElementById("platform");
    platformSelect.innerHTML = `
        <option value="">Select Platform</option>
        <option value="1">Nequi</option>
        <option value="2">Bancolombia</option>
    `;
}

// Render static options for clients (example, can be replaced with dynamic)
function renderClientOptions() {

}

// Render static options for bills (example, can be replaced with dynamic)
function renderBillOptions() {
}

// Load transactions from API and render table
async function loadTransactions() {
    try {
        const res = await fetch(API_URL);
        
        const data = await res.json();
        
        // Clear and create table header
        tableTransactions.innerHTML = "";
        data.forEach(t => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${t.id_transaction || ''}</td>
                <td>${t.client || ''}</td>
                <td>${t.bill_number || ''}</td>
                <td>${t.transaction_datetime ? t.transaction_datetime.split('T')[0] : ''}</td>
                <td>${t.transaction_amount || ''}</td>
                <td>${getPlatformText(t.id_platform)}</td>
                <td>${getStatusText(t.id_status)}</td>
                <td>
                    <button class='btn btn-warning btn-sm btn-edit' data-id="${t.id_transaction}">Edit</button>
                    <button class='btn btn-danger btn-sm btn-delete' data-id="${t.id_transaction}">Delete</button>
                </td>
            `;
            tableTransactions.appendChild(row);
        });

        // Attach event listeners
        attachEventListeners();
    } catch (error) {
        console.error("Error loading transactions:", error);
}

// Helper to convert status id to text
function getStatusText(id_status) {
    const statusMap = {
        1: "Pending",
        2: "Completed",
        3: "Failed"
    };
    return statusMap[id_status] || "";
}

// Helper to convert status text to id
function getStatusId(status) {
    const statusMap = {
        "Pending": 1,
        "Completed": 2,
        "Failed": 3
    };
    return statusMap[status] || 1; // Default to Pending
}

// Helper to convert platform id to text
function getPlatformText(id_platform) {
    const platformMap = {
        1: "Nequi",
        2: "Bancolombia"
    };
    return platformMap[id_platform] || "";
}

// Attach event listeners to edit and delete buttons
function attachEventListeners() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            await editTransaction(id);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            await deleteTransaction(id);
        });
    });
}

// Save or update transaction
transactionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id_transaction = document.getElementById("id_transaction").value;
    const formData = {
        client: document.getElementById("client").value,
        bill_number: document.getElementById("bills").value,
        transaction_datetime: document.getElementById("transaction_date").value,
        transaction_amount: document.getElementById("service").value,
        paid_amount: document.getElementById("service").value,
        id_platform: document.getElementById("platform").value,
        id_status: getStatusId(document.getElementById("status").value),
        id_type: 1,
        transaction_code: id_transaction ? `TX-${id_transaction}` : `TX-${Date.now()}`
    };

    try {
        const method = id_transaction ? "PUT" : "POST";
        const url = id_transaction ? `${API_URL}/${id_transaction}` : API_URL;
        
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to save transaction');

        transactionForm.reset();
        document.getElementById("id_transaction").value = '';
        await loadTransactions();
        alert(`Transaction ${id_transaction ? 'updated' : 'created'} successfully!`);
    } catch (error) {
        console.error("Error saving transaction:", error);
        alert("Error saving transaction: " + error.message);
    }
});

// Edit transaction
async function editTransaction(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch transaction');
        
        const t = await response.json();
        
        // Fill the form with transaction data
        document.getElementById("id_transaction").value = t.id_transaction || '';
        document.getElementById("client").value = t.client || '';
        document.getElementById("bills").value = t.bill_number || '';
        document.getElementById("transaction_date").value = t.transaction_datetime ? t.transaction_datetime.split('T')[0] : '';
        document.getElementById("service").value = t.transaction_amount || '';
        document.getElementById("platform").value = t.id_platform || '';
        document.getElementById("status").value = getStatusText(t.id_status);
        
        // Scroll to form for better UX
        transactionForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error("Error loading transaction:", error);
        alert("Error loading transaction: " + error.message);
    }
}

// Delete transaction
async function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { 
            method: "DELETE" 
        });
        
        if (!response.ok) throw new Error('Failed to delete transaction');
        
        await loadTransactions();
        alert("Transaction deleted successfully!");
    } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Error deleting transaction: " + error.message);
    }
}

// Initialize the application
function init() {
    renderStatusOptions();
    renderPlatformOptions();
    loadTransactions();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
renderClientOptions();
renderBillOptions();
}   
