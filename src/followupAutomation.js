function generateFollowUpTasks(inactiveCustomers, existingTasks) {

    // Preserve existing tasks without mutating the caller's array
    const updatedTasks = [...existingTasks];

    let createdCount = 0;

    // Prevent duplicate open inactivity follow-ups across repeated runs 
    inactiveCustomers.forEach(customer => {
        const hasOpenFollowUp = updatedTasks.some((existingtask) =>
            customer.customerId === existingtask.customerId &&
        existingtask.type === "inactive_customer_followup" &&
        existingtask.status === "open");

        if (!hasOpenFollowUp) {
            const newTask = {
                customerId: customer.customerId,
                type: "inactive_customer_followup",
                status: "open",
                reason: `No completed purchase in ${customer.daysInactive} days`
            };

            updatedTasks.push(newTask);

            createdCount = createdCount + 1;

        };

    });

    return {
        tasks: updatedTasks,
        createdCount
    };
}

module.exports = { generateFollowUpTasks };