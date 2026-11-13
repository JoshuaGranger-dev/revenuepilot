const assert = require("node:assert/strict");
const test = require("node:test");

const { runCustomerAutomation } = require("../src/automationRunner");

const customers = [
    { id: 101, name: "Alpha Fitness" },
    { id: 102, name: "Bright Dental" }
];

const transactions = [
    {
        customerId: 101,
        amount: 200,
        status: "completed",
        date: "2026-10-01"
    },
    {
        customerId: 102,
        amount: 150,
        status: "completed",
        date: "2026-11-05"
    }
];

const existingTasks = [];

const asOfDate = "2026-11-13";
const inactiveDays = 30;

test("correct inactive customer, followup Task, and summary generated", () => {
    const results = runCustomerAutomation(customers, transactions, existingTasks, asOfDate, inactiveDays);

    assert.deepStrictEqual(results.inactiveCustomers, [
        {
            customerId: 101,
            name: "Alpha Fitness",
            lastPurchaseDate: "2026-10-01",
            daysInactive: 43
        }
    ]);
    assert.deepStrictEqual(results.tasks, [
        {
            customerId: 101,
            type: "inactive_customer_followup",
            status: "open",
            reason: "No completed purchase in 43 days"
        }
    ]);
    assert.deepStrictEqual(results.summary, {
        inactiveCount: 1,
        createdCount: 1,
        totalTaskCount: 1
    });
});

test("repeated workflow execution does not create duplicate tasks", () => {
    const firstRun = runCustomerAutomation(customers, transactions, existingTasks, asOfDate, inactiveDays);
    const secondRun = runCustomerAutomation(customers, transactions, firstRun.tasks, asOfDate, inactiveDays);

    assert.deepStrictEqual(firstRun.inactiveCustomers, secondRun.inactiveCustomers);
    assert.deepStrictEqual(firstRun.tasks, secondRun.tasks);
    assert.deepStrictEqual(secondRun.summary, {
        inactiveCount: 1,
        createdCount: 0,
        totalTaskCount: 1
    });
});

test("return of emtpy arrays and summary of 0 when no inactive customer", () => {
    const noInactiveTransactions = [
        {
            customerId: 102,
            amount: 150,
            status: "completed",
            date: "2026-11-05"
        }
    ];

    const recentCustomers = [
        { id: 102, name: "Bright Dental" }
    ];
    const results = runCustomerAutomation(recentCustomers, noInactiveTransactions, existingTasks, asOfDate, inactiveDays);
    assert.deepStrictEqual(results.inactiveCustomers, []);
    assert.deepStrictEqual(results.tasks, []);
    assert.deepStrictEqual(results.summary, {
        inactiveCount: 0,
        createdCount: 0,
        totalTaskCount: 0
    });
});

test("workflow does not mutate input data", () => {
    const originalCustomers = structuredClone(customers);
    const originalTransactions = structuredClone(transactions);
    const originalExistingTasks = structuredClone(existingTasks);

    runCustomerAutomation(customers, transactions, existingTasks, asOfDate, inactiveDays);

    assert.deepStrictEqual(customers, originalCustomers);
    assert.deepStrictEqual(transactions, originalTransactions);
    assert.deepStrictEqual(existingTasks, originalExistingTasks);
});