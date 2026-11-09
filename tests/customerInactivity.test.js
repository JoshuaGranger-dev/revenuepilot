const assert = require("node:assert/strict");
const test = require("node:test");
const { findInactiveCustomers } = require("../src/customerInactivity");

const customers = [
    { id: 101, name: "Alpha Fitness" },
    { id: 102, name: "Bright Dental" },
    { id: 103, name: "Core Athletics" },
    { id: 104, name: "Delta Tech" }
];

const transactions = [
    {
        id: 1,
        customerId: 101,
        amount: 500,
        status: "completed",
        date: "2026-09-01"
    },
    {
        id: 2,
        customerId: 102,
        amount: 800,
        status: "completed",
        date: "2026-10-20"
    },
    {
        id: 3,
        customerId: 101,
        amount: 300,
        status: "completed",
        date: "2026-10-01"
    },
    {
        id: 4,
        customerId: 103,
        amount: 600,
        status: "pending",
        date: "2026-09-10"
    },
    {
        id: 5,
        customerId: 104,
        amount: 900,
        status: "completed",
        date: "2026-11-01"
    }
];

const futureCustomers = [
    { id: 1, name: "Future Customer" }
];

const futureTransactions = [
    {
        id: 1,
        customerId: 1,
        amount: 500,
        status: "completed",
        date: "2026-12-20"
    }
];

const testCustomers = [
    { id: 1, name: "Alpha Fitness" }
];

const testTransactions = [
    {
        id: 1,
        customerId: 1,
        amount: 500,
        status: "completed",
        date: "2026-09-01"
    },
    {
        id: 2,
        customerId: 1,
        amount: 500,
        status: "completed",
        date: "2026-12-01"
    }
];

const tiedCustomers = [
    {id: 1, name: "Alpha Fitness"},
    { id: 2, name: "Bright Dental" }
]

const tiedTransactions = [
    {
        id: 1,
        customerId: 2,
        amount: 500,
        status: "completed",
        date: "2026-09-01"
    },
    {
        id: 2,
        customerId: 1,
        amount: 500,
        status: "completed",
        date: "2026-09-01"
    }
]

test("returns array of appropriate cusomter data sorted by customerId with inactivity dates equal", () => {
    assert.deepStrictEqual(findInactiveCustomers(tiedCustomers, tiedTransactions, "2026-11-09", 30),
        [
            {
                customerId: 1,
                name: "Alpha Fitness",
                lastPurchaseDate: "2026-09-01",
                daysInactive: 69
            },
            {
                customerId: 2,
                name: "Bright Dental",
                lastPurchaseDate: "2026-09-01",
                daysInactive: 69
            }
        ]
    );
});

test("return empty array when only a future transaction is present", () => {
    assert.deepStrictEqual(
        findInactiveCustomers(
            futureCustomers,
            futureTransactions,
            "2026-11-09",
            30
        ),
        []
    );
});

test("return correct transaction when future transaction present", () => {
    assert.deepStrictEqual(
        findInactiveCustomers(
            testCustomers,
            testTransactions,
            "2026-11-09",
            30
        ),
        [
            {
                customerId: 1,
                name: "Alpha Fitness",
                lastPurchaseDate: "2026-09-01",
                daysInactive: 69
            }
        ]
    );
});

test("does not mutate the input arrays", () => {
    const originalCustomers = structuredClone(customers);
    const originalTransactions = structuredClone(transactions);

    findInactiveCustomers(customers, transactions, "2026-11-09", 30);

    assert.deepStrictEqual(customers, originalCustomers);
    assert.deepStrictEqual(transactions, originalTransactions);
});

test("returns array of correct customer data", () => {
    assert.deepStrictEqual(findInactiveCustomers(customers, transactions, "2026-11-09", 30),
        [
            {
                customerId: 101,
                name: 'Alpha Fitness',
                lastPurchaseDate: '2026-10-01',
                daysInactive: 39
            }
        ]
    );
});

test("returns empty array when given empty array", () => {
    assert.deepStrictEqual(findInactiveCustomers(customers, [], "2026-11-09", 30),
        []
    );
});

