const { findInactiveCustomers } = require("./customerInactivity");
const { generateFollowUpTasks } = require("./followupAutomation");

function runCustomerAutomation(
    customers,
    transactions,
    existingTasks,
    asOfDate,
    inactiveDays
) {
    // Coordinate inactivity detection and follow-up generation without duplicating business logic.
    const inactiveCustomers = findInactiveCustomers(customers, transactions, asOfDate, inactiveDays );

    const newFollowupTasks = generateFollowUpTasks(inactiveCustomers, existingTasks);

    const inactiveCount = inactiveCustomers.length;
    const existingTaskCount = existingTasks.length;
    const totalTaskCount = newFollowupTasks.tasks.length;

    return {
        inactiveCustomers,
        tasks: newFollowupTasks.tasks,
        summary: {
            inactiveCount,
            createdCount: newFollowupTasks.createdCount,
            totalTaskCount
        }
    };

}

module.exports = { runCustomerAutomation };