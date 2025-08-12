import { loadBillsToDatabase } from "./load_bills.js";
import { loadTransactionsToDatabase } from "./load_transactions.js";
import { loadClientsToDatabase } from "./load_clients.js";

(async () => {
    try {
        console.log('Starting seeders...');

        await loadClientsToDatabase();
        await loadBillsToDatabase();
        await loadTransactionsToDatabase();

        console.log('✅ All seeders executed successfully.');
    } catch (error) {
        console.error('❌ Error running seeders:', error.message);
    } finally {
        process.exit();
    }
})();