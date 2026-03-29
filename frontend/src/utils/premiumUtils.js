const cycleMap = {
  MONTHLY: 1,
  QUARTERLY: 3,
  HALF_YEARLY: 6,
  YEARLY: 12
};

const formatDate = (date) => date.toISOString().split("T")[0];

export const getNextDueDate = (lastPaidDate, premiumCycle) => {
  const baseDate = new Date(`${lastPaidDate}T00:00:00`);
  const nextDue = new Date(baseDate);
  nextDue.setMonth(nextDue.getMonth() + (cycleMap[premiumCycle] || 1));
  return nextDue;
};

export const getClientStatus = (lastPaidDate, premiumCycle) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextDueDate = getNextDueDate(lastPaidDate, premiumCycle);
  nextDueDate.setHours(0, 0, 0, 0);

  const differenceInDays = Math.ceil((nextDueDate - today) / (1000 * 60 * 60 * 24));

  if (differenceInDays < 0) {
    return {
      status: "overdue",
      paymentStatus: "unpaid",
      nextDueDate: formatDate(nextDueDate)
    };
  }

  if (differenceInDays <= 7) {
    return {
      status: "due",
      paymentStatus: "due",
      nextDueDate: formatDate(nextDueDate)
    };
  }

  return {
    status: "upcoming",
    paymentStatus: "paid",
    nextDueDate: formatDate(nextDueDate)
  };
};

export const enrichClients = (clients) =>
  clients.map((client) => ({
    ...client,
    ...getClientStatus(client.lastPaidDate, client.premiumCycle)
  }));
