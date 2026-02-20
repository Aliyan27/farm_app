import prisma from "../../utils/Prisma";

interface IncomeStatementInput {
  startDate?: string;
  endDate?: string;
  farm?: string;
}

export interface IncomeStatementResponse {
  period: string;
  grossRevenue: number;
  otherIncome: number;
  totalRevenue: number;
  cogs: {
    chicken: number;
    feed: number;
    medicine: number;
    vaccine: number;
    total: number;
  };
  operatingExpenses: {
    rent: number;
    utilities: number;
    salariesPayments: number;
    mess: number;
    powerElectric: number;
    pol: number;
    packingMaterial: number;
    repairMaintenance: number;
    officeExpenses: number;
    meetingRefreshment: number;
    travellingLogistics: number;
    miscellaneous: number;
    total: number;
  };
  totalExpenses: number;
  netIncome: number;
  notes?: string;
}

export const getIncomeStatementService = async (
  input: IncomeStatementInput = {},
): Promise<{
  statusCode: number;
  message: string;
  data: IncomeStatementResponse | null;
}> => {
  const { startDate, endDate, farm } = input;

  const commonWhere: any = {};
  if (farm) commonWhere.farm = farm;

  const eggSaleWhere = { ...commonWhere };
  const expenseWhere = { ...commonWhere };

  if (startDate) {
    eggSaleWhere.saleDate = { gte: new Date(startDate) };
    expenseWhere.expenseDate = { gte: new Date(startDate) };
  }
  if (endDate) {
    eggSaleWhere.saleDate = {
      ...eggSaleWhere.saleDate,
      lte: new Date(endDate),
    };
    expenseWhere.expenseDate = {
      ...expenseWhere.expenseDate,
      lte: new Date(endDate),
    };
  }

  try {
    const eggSales = await prisma.eggSale.aggregate({
      where: eggSaleWhere,
      _sum: { amountReceived: true },
    });

    const grossRevenue = eggSales._sum.amountReceived ?? 0;

    const otherIncome = 0;

    const totalRevenue = grossRevenue + otherIncome;

    const cogsHeads = ["CHICKEN", "FEED", "MEDICINE", "VACCINE"];
    const cogsExpenses = await prisma.expense.groupBy({
      by: ["head"],
      where: { ...expenseWhere, head: { in: cogsHeads } },
      _sum: { expenseCost: true },
    });

    const cogs = {
      chicken: 0,
      feed: 0,
      medicine: 0,
      vaccine: 0,
      total: 0,
    };

    cogsExpenses.forEach((group) => {
      const cost = group._sum.expenseCost ?? 0;
      switch (group.head) {
        case "CHICKEN":
          cogs.chicken = cost;
          break;
        case "FEED":
          cogs.feed = cost;
          break;
        case "MEDICINE":
          cogs.medicine = cost;
          break;
        case "VACCINE":
          cogs.vaccine = cost;
          break;
      }
      cogs.total += cost;
    });

    const opExHeads = [
      "RENT",
      "UTILITIES",
      "SALARIES_PAYMENTS",
      "MESS",
      "POWER_ELECTRIC",
      "POL",
      "PACKING_MATERIAL",
      "REPAIR_MAINTENANCE",
      "OFFICE_EXPENSES",
      "MEETING_REFRESHMENT",
      "TRAVELLING_LOGISTICS",
      "MISCELLANEOUS",
    ];

    const opExpenses = await prisma.expense.groupBy({
      by: ["head"],
      where: { ...expenseWhere, head: { in: opExHeads } },
      _sum: { expenseCost: true },
    });

    const operatingExpenses = {
      rent: 0,
      utilities: 0,
      salariesPayments: 0,
      mess: 0,
      powerElectric: 0,
      pol: 0,
      packingMaterial: 0,
      repairMaintenance: 0,
      officeExpenses: 0,
      meetingRefreshment: 0,
      travellingLogistics: 0,
      miscellaneous: 0,
      total: 0,
    };

    opExpenses.forEach((group) => {
      const cost = group._sum.expenseCost ?? 0;
      switch (group.head) {
        case "RENT":
          operatingExpenses.rent = cost;
          break;
        case "UTILITIES":
          operatingExpenses.utilities = cost;
          break;
        case "SALARIES_PAYMENTS":
          operatingExpenses.salariesPayments = cost;
          break;
        case "MESS":
          operatingExpenses.mess = cost;
          break;
        case "POWER_ELECTRIC":
          operatingExpenses.powerElectric = cost;
          break;
        case "POL":
          operatingExpenses.pol = cost;
          break;
        case "PACKING_MATERIAL":
          operatingExpenses.packingMaterial = cost;
          break;
        case "REPAIR_MAINTENANCE":
          operatingExpenses.repairMaintenance = cost;
          break;
        case "OFFICE_EXPENSES":
          operatingExpenses.officeExpenses = cost;
          break;
        case "MEETING_REFRESHMENT":
          operatingExpenses.meetingRefreshment = cost;
          break;
        case "TRAVELLING_LOGISTICS":
          operatingExpenses.travellingLogistics = cost;
          break;
        case "MISCELLANEOUS":
          operatingExpenses.miscellaneous = cost;
          break;
      }
      operatingExpenses.total += cost;
    });

    const totalExpenses = cogs.total + operatingExpenses.total;

    const netIncome = totalRevenue - totalExpenses;

    let period = "All time";
    if (startDate || endDate) {
      period = `From ${startDate || "earliest"} to ${endDate || "latest"}`;
    }

    const result: IncomeStatementResponse = {
      period,
      grossRevenue,
      otherIncome,
      totalRevenue,
      cogs,
      operatingExpenses,
      totalExpenses,
      netIncome,
      notes: netIncome >= 0 ? "Profitable" : "Loss",
    };

    return {
      statusCode: 200,
      message: "Income statement generated",
      data: result,
    };
  } catch (err: any) {
    console.error("[getIncomeStatementService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to generate income statement",
      data: null,
    };
  }
};
