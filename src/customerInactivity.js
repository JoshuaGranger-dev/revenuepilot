function findInactiveCustomers(
    customers, 
    transactions,
    asOfDate,
    inactiveDays
) {
    // Exclude incomplete and future-dated transactions from inactivity calculations.
    const filterTransactions = transactions.filter((transaction) => transaction.status === "completed" && transaction.date <= asOfDate);

    // Retain each customer's latest eligible purchase without sorting all transactions.
    const mostRecentTransactionByCustomerId = Object.values(
        filterTransactions.reduce((acc, current) => {
            const currentId = current.customerId;
            const existing = acc[currentId];

            if (!existing || new Date(current.date) > new Date(existing.date)) {
                acc[currentId] = current;
            }

            return acc;
        }, {})
    );

    const daysInactiveTransactions = new Map();

    mostRecentTransactionByCustomerId.forEach(transaction => {
        const start = Date.parse(asOfDate);
        const end = Date.parse(transaction.date);
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        const days = (start - end) / millisecondsPerDay;
        daysInactiveTransactions.set(transaction.customerId, {
            customerId: transaction.customerId,
            lastPurchaseDate: transaction.date,
            daysInactive: days
        });
    });

    const recentTransactionsByCustomerID = Array.from(daysInactiveTransactions.values());


    const filterRecentTransactions = recentTransactionsByCustomerID.filter((transaction) => transaction.daysInactive >= inactiveDays);


    const mergedMap = new Map();
    const customerLookUp = new Map();

    customers.forEach(customer => {
        customerLookUp.set(customer.id, {... customer})
    });

    filterRecentTransactions.forEach(filterRecentTransaction => {
        const matchId = filterRecentTransaction.customerId;
        const customerData = customerLookUp.get(matchId);
        if (customerLookUp.has(matchId)) {  
            mergedMap.set(matchId, { ...filterRecentTransaction, ...customerData });
        }
    });

    const customersInactiveTransactionData = Array.from(mergedMap.values());

    const inactiveCustomers = customersInactiveTransactionData.sort((a, b) => {
        const primary = b.daysInactive - a.daysInactive;

        const secondary = a.customerId - b.customerId;

        return primary || secondary;
    }).map((customerInactiveTransactionData) => {
        return {
            customerId: customerInactiveTransactionData.customerId,
            name: customerInactiveTransactionData.name,
            lastPurchaseDate: customerInactiveTransactionData.lastPurchaseDate,
            daysInactive: customerInactiveTransactionData.daysInactive
        };
    });

    return inactiveCustomers;

}

module.exports = { findInactiveCustomers };

