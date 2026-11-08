const assert = require("node:assert/strict");
const customers = [
    { id: 101, name: "Alpha Fitness", industry: "Fitness" },
    { id: 102, name: "Bright Dental", industry: "Healthcare" },
    { id: 103, name: "Core Athletics", industry: "Fitness" },
    { id: 104, name: "Delta Tech", industry: "Technology" }
];

const transactions = [
    { id: 1, customerId: 101, amount: 500, status: "completed" },
    { id: 2, customerId: 102, amount: 800, status: "completed" },
    { id: 3, customerId: 101, amount: 300, status: "completed" },
    { id: 4, customerId: 103, amount: 1200, status: "pending" },
    { id: 5, customerId: 103, amount: 600, status: "completed" },
    { id: 6, customerId: 102, amount: 200, status: "completed" },
    { id: 7, customerId: 104, amount: 950, status: "completed" }
];

function getTopCustomers(customers, transactions, limit) {
    if (!customers || !transactions || customers.length === 0 || transactions.length === 0) {
        return [];
    }
    // Count only completed transactions to avoid overstating customer revenue.
    const completedTransactions = transactions.filter(transaction => transaction.status === "completed")

    const revenueMap = new Map();

    completedTransactions.forEach(transaction => {
        if (revenueMap.has(transaction.customerId)) {
            const existingCustomer = revenueMap.get(transaction.customerId);
            revenueMap.set(transaction.customerId, {
                customerId: transaction.customerId,
                totalRevenue: existingCustomer.totalRevenue + transaction.amount,
                orderCount: existingCustomer.orderCount + 1 
            });
        }else {
            revenueMap.set(transaction.customerId, {
                customerId: transaction.customerId,
                totalRevenue: transaction.amount,
                orderCount: 1
            });
        }
    });

    const customersRevenue = Array.from(revenueMap.values());

    const mergedMap = new Map();
    const customerLookUp = new Map();

    customers.forEach(customer => {
        customerLookUp.set(customer.id, {... customer})
    });
    //Only include known customers with completed transaction revenue.
    customersRevenue.forEach(customerRevenue => {
        const matchId = customerRevenue.customerId;
        const customerData = customerLookUp.get(matchId);
        if (customerLookUp.has(matchId)) {  
            mergedMap.set(matchId, { ...customerRevenue, ...customerData });
        }
    });

    const customersTotalRevenue = Array.from(mergedMap.values());

    const sortedTotalRevenue = customersTotalRevenue.sort((a, b) => {
        if (a.totalRevenue < b.totalRevenue) {
            return 1;
        }
        if (a.totalRevenue > b.totalRevenue) {
            return -1;
        }
        if (a.totalRevenue === b.totalRevenue){
            return a.customerId - b.customerId;
        }
    }).map((customerTotalRevenue) => {
        return {
            customerId: customerTotalRevenue.customerId,
            name: customerTotalRevenue.name,
            industry: customerTotalRevenue.industry,
            totalRevenue: customerTotalRevenue.totalRevenue,
            transactionCount: customerTotalRevenue.orderCount
        };
    });

    const topSortedTotalRevenue = sortedTotalRevenue.slice(0, Math.max(0, limit));

    return topSortedTotalRevenue;
}

module.exports = { getTopCustomers };


