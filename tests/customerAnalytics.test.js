const assert = require("node:assert/strict");
const test = require("node:test");
const { getTopCustomers } = require("../src/customerAnalytics");

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

const testCustomers = [
    { id: 1, name: "Alpha", industry: "Fitness" },
    { id: 2, name: "Beta", industry: "Healthcare" }
];

const testTransactions = [
    { id: 1, customerId: 1, amount: 500, status: "completed" },
    { id: 2, customerId: 2, amount: 900, status: "pending" }
];

const testSameRevCustomers = [
    { id: 2, name: "Alpha", industry: "Fitness" },
    { id: 1, name: "Beta", industry: "Healthcare" }
]

const testSameRevTransactions = [
    { id: 1, customerId: 2, amount: 500, status: "completed" },
    { id: 2, customerId: 1, amount: 500, status: "completed" }
];

test("returns an empty array when limit is zero", () => {
    assert.deepStrictEqual(
        getTopCustomers(customers, transactions, 0),
        []
    );
});

test("returns an empty array when limit is negative", () => {
    assert.deepStrictEqual(
        getTopCustomers(customers, transactions, -1),
        []
    );
});

test("returns an empty array when given empty array", () => {
    assert.deepStrictEqual(
        getTopCustomers(customers, [], 3),
        []
    );
});

test("return array with object of appropriate customer data", () => {
    assert.deepStrictEqual(
        getTopCustomers(testCustomers, testTransactions, 5),
        [
            {
                customerId: 1,
                name: "Alpha",
                industry: "Fitness",
                totalRevenue: 500,
                transactionCount: 1
            }
        ]
    );
});

test("returns an empty array when customer's id and transcations customer id do not match", () => {
    assert.deepStrictEqual(
        getTopCustomers(
            [{ id: 101, name: "Alpha Fitness", industry: "Fitness" }],
            [{ id: 1, customerId: 999, amount: 500, status: "completed" }],
            5
        ),
        []
    );
});

test("returns array of appropriate cusomter data sorted by customerId with reveneue equal", () => {
    assert.deepStrictEqual(getTopCustomers(testSameRevCustomers, testSameRevTransactions, 5),
        [
            {
                customerId: 1,
                name: "Beta",
                industry: "Healthcare",
                totalRevenue: 500,
                transactionCount: 1
            },
            {
                customerId: 2,
                name: "Alpha",
                industry: "Fitness",
                totalRevenue: 500,
                transactionCount: 1
            }
        ]
    );
});

test("returns array of correct customer data", () => {
    assert.deepStrictEqual(getTopCustomers(customers, transactions, 3),
        [
            {
                customerId: 102,
                name: "Bright Dental",
                industry: "Healthcare",
                totalRevenue: 1000,
                transactionCount: 2
            },
            {
                customerId: 104,
                name: "Delta Tech",
                industry: "Technology",
                totalRevenue: 950,
                transactionCount: 1
            },

            {
                customerId: 101,
                name: "Alpha Fitness",
                industry: "Fitness",
                totalRevenue: 800,
                transactionCount: 2
            }
        ]
    );
});

test("does not mutate the input arrays", () => {
    const originalCustomers = structuredClone(customers);
    const originalTransactions = structuredClone(transactions);

    getTopCustomers(customers, transactions, 3);

    assert.deepStrictEqual(customers, originalCustomers);
    assert.deepStrictEqual(transactions, originalTransactions);
});