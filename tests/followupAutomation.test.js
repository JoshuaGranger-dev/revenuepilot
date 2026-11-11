const assert = require("node:assert/strict");
const test = require("node:test");

const { generateFollowUpTasks } = require("../src/followupAutomation");

const inactiveCustomers = [
    {
        customerId: 101,
        name: "Alpha Fitness",
        lastPurchaseDate: "2026-10-01",
        daysInactive: 39
    },
    {
        customerId: 102,
        name: "Bright Dental",
        lastPurchaseDate: "2026-09-15",
        daysInactive: 55
    },
    {
        customerId: 103,
        name: "Core Athletics",
        lastPurchaseDate: "2026-09-01",
        daysInactive: 69
    }
];

const existingTasks = [
    {
        customerId: 101,
        type: "inactive_customer_followup",
        status: "open",
        reason: "No completed purchase in 38 days"
    },
    {
        customerId: 102,
        type: "inactive_customer_followup",
        status: "completed",
        reason: "Previous follow-up completed"
    }
];

test("does not duplicate an existing open follow-up", () => {
    const inactiveCustomers = [
        {
            customerId: 101,
            name: "Alpha Fitness",
            daysInactive: 39
        }
    ];

    const existingTasks = [
        {
            customerId: 101,
            type: "inactive_customer_followup",
            status: "open",
            reason: "Previous follow-up"
        }
    ];

    const result = generateFollowUpTasks(
        inactiveCustomers,
        existingTasks
    );

    assert.strictEqual(result.createdCount, 0);
    assert.deepStrictEqual(result.tasks, existingTasks);
});

test("second run of function creates 0 new tasks", () => {
    const firstRun = generateFollowUpTasks(
        inactiveCustomers,
        existingTasks
    );

    const secondRun = generateFollowUpTasks(
        inactiveCustomers,
        firstRun.tasks
    );

    assert.strictEqual(secondRun.createdCount, 0);
    assert.deepStrictEqual(secondRun.tasks, firstRun.tasks);
});

test("completed follow-up gets a new task created", () => {
    const inactiveCustomers = [
        {
            customerId: 101,
            name: "Alpha Fitness",
            daysInactive: 39
        }
    ];

    const existingTasks = [
        {
            customerId: 101,
            type: "inactive_customer_followup",
            status: "completed",
            reason: "Previous follow-up completed"
        }
    ];

    const result = generateFollowUpTasks(
        inactiveCustomers,
        existingTasks
    );

    assert.strictEqual(result.createdCount, 1);
    assert.deepStrictEqual(result.tasks, [
        {
            customerId: 101,
            type: "inactive_customer_followup",
            status: "completed",
            reason: "Previous follow-up completed"
        },
        {
            customerId: 101,
            type: "inactive_customer_followup",
            status: "open",
            reason: "No completed purchase in 39 days"
        }
    ]);
});

test("no follow-up task then one gets created for that customer", () => {

    const inactiveCustomers = [
    {
        customerId: 101,
        name: "Alpha Fitness",
        lastPurchaseDate: "2026-10-01",
        daysInactive: 39
    },
    {
        customerId: 103,
        name: "Core Athletics",
        lastPurchaseDate: "2026-09-01",
        daysInactive: 69
    }
    ];

    const existingTasks = [
    {
        customerId: 101,
        type: "inactive_customer_followup",
        status: "open",
        reason: "No completed purchase in 39 days"
    }
    ];

    const firstRun = generateFollowUpTasks(
        inactiveCustomers,
        existingTasks
    );

    assert.strictEqual(firstRun.createdCount, 1);
    assert.deepStrictEqual(firstRun.tasks, [
        {
            customerId: 101,
            type: "inactive_customer_followup",
            status: "open",
            reason: "No completed purchase in 39 days"
        },
        {
            customerId: 103,
            type: 'inactive_customer_followup',
            status: 'open',
            reason: 'No completed purchase in 69 days'
        }
    ]);
});

test("different type of task doesn't block a follow-up task from being created ", () => {
    const inactiveCustomers = [
        {
            customerId: 101,
            name: "Alpha Fitness",
            daysInactive: 39
        }
    ];

    const existingTasks = [
        {
            customerId: 101,
            type: "Billing_issue",
            status: "open",
            reason: "Billing_issue unresolved"
        }
    ];

    const result = generateFollowUpTasks(
        inactiveCustomers,
        existingTasks
    );

    assert.strictEqual(result.createdCount, 1);
    assert.deepStrictEqual(result.tasks, [
        {
            customerId: 101,
            type: "Billing_issue",
            status: "open",
            reason: "Billing_issue unresolved"
        },
        {
            customerId: 101,
            type: "inactive_customer_followup",
            status: "open",
            reason: "No completed purchase in 39 days"
        }
    ]);
});

test("does not mutate the input arrays", () => {
    const originalInactiveCustomers = structuredClone(inactiveCustomers);
    const originalExistingTasks = structuredClone(existingTasks);

    generateFollowUpTasks(inactiveCustomers, existingTasks);

    assert.deepStrictEqual(inactiveCustomers, originalInactiveCustomers);
    assert.deepStrictEqual(existingTasks, originalExistingTasks);
});

test("duplicate customers still created 1 new task for that customer", () => {
    const duplicateCustomers = [
    { customerId: 101, name: "Alpha Fitness", daysInactive: 39 },
    { customerId: 101, name: "Alpha Fitness", daysInactive: 39 }
    ];

    const existingTasks = [];

    const results = generateFollowUpTasks(duplicateCustomers, existingTasks);

    assert.strictEqual(results.createdCount, 1);
    assert.strictEqual(results.tasks.length, 1);
});