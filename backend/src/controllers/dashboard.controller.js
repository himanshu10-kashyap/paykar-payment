import { Op, fn, col, literal } from "sequelize";

import Payment from "../models/Payment.js";
import Vendor from "../models/Vendor.js";

const getStartOfDay = (date = new Date()) => {
  const start = new Date(date);

  start.setHours(0, 0, 0, 0);

  return start;
};

const getEndOfDay = (date = new Date()) => {
  const end = new Date(date);

  end.setHours(23, 59, 59, 999);

  return end;
};

const getStartOfDaysAgo = (days) => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);

  return date;
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getLast7Days = () => {
  const days = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    days.push({
      date,
      key: formatDateKey(date),
      label: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
    });
  }

  return days;
};

export const getDashboard = async (req, res) => {
  try {
    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();

    const last7DaysStart = getStartOfDaysAgo(6);

    const [
      totalPayments,
      successfulPayments,
      pendingPayments,
      failedPayments,
      cancelledPayments,
      expiredPayments,

      totalAmount,
      successfulAmount,
      pendingAmount,
      failedAmount,

      todayPayments,
      todaySuccessfulPayments,
      todayAmount,
      todaySuccessfulAmount,

      totalVendors,
      activeVendors,
      inactiveVendors,

      recentPayments,

      dailyPaymentStats,
    ] = await Promise.all([
      // --------------------------------------------------
      // PAYMENT COUNTS
      // --------------------------------------------------

      Payment.count(),

      Payment.count({
        where: {
          status: "SUCCESS",
        },
      }),

      Payment.count({
        where: {
          status: "PENDING",
        },
      }),

      Payment.count({
        where: {
          status: "FAILED",
        },
      }),

      Payment.count({
        where: {
          status: "CANCELLED",
        },
      }),

      Payment.count({
        where: {
          status: "EXPIRED",
        },
      }),

      // --------------------------------------------------
      // PAYMENT AMOUNTS
      // --------------------------------------------------

      Payment.sum("amount"),

      Payment.sum("amount", {
        where: {
          status: "SUCCESS",
        },
      }),

      Payment.sum("amount", {
        where: {
          status: "PENDING",
        },
      }),

      Payment.sum("amount", {
        where: {
          status: "FAILED",
        },
      }),

      // --------------------------------------------------
      // TODAY
      // --------------------------------------------------

      Payment.count({
        where: {
         created_at: {
  [Op.between]: [todayStart, todayEnd],
},
        },
      }),

      Payment.count({
        where: {
          status: "SUCCESS",
          created_at: {
  [Op.between]: [todayStart, todayEnd],
},
        },
      }),

      Payment.sum("amount", {
        where: {
          created_at: {
  [Op.between]: [todayStart, todayEnd],
},
        },
      }),

      Payment.sum("amount", {
        where: {
          status: "SUCCESS",
         created_at: {
  [Op.between]: [todayStart, todayEnd],
},
        },
      }),

      // --------------------------------------------------
      // VENDORS
      // --------------------------------------------------

      Vendor.count(),

      Vendor.count({
        where: {
          isActive: true,
        },
      }),

      Vendor.count({
        where: {
          isActive: false,
        },
      }),

      // --------------------------------------------------
      // RECENT PAYMENTS
      // --------------------------------------------------

      Payment.findAll({
        include: [
          {
            model: Vendor,
            as: "vendor",
            attributes: [
              "id",
              "companyName",
              "slug",
              "isActive",
            ],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: 10,
      }),

      // --------------------------------------------------
      // LAST 7 DAYS
      // --------------------------------------------------

      Payment.findAll({
        attributes: [
          [
            fn(
              "DATE",
              col("created_at")
            ),
            "date",
          ],

          [
            fn(
              "COUNT",
              col("id")
            ),
            "count",
          ],

          [
            fn(
              "COALESCE",
              fn(
                "SUM",
                col("amount")
              ),
              0
            ),
            "amount",
          ],

          [
            fn(
              "SUM",
              literal(
                "CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END"
              )
            ),
            "successfulCount",
          ],

          [
            fn(
              "COALESCE",
              fn(
                "SUM",
                literal(
                  "CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END"
                )
              ),
              0
            ),
            "successfulAmount",
          ],
        ],

        where: {
  created_at: {
    [Op.gte]: last7DaysStart,
  },
},
        group: [
          fn(
            "DATE",
            col("created_at")
          ),
        ],

        order: [
          [
            fn(
              "DATE",
              col("created_at")
            ),
            "ASC",
          ],
        ],

        raw: true,
      }),
    ]);

    // --------------------------------------------------
    // PREPARE LAST 7 DAYS CHART
    // --------------------------------------------------

    const statsMap = new Map();

    dailyPaymentStats.forEach((item) => {
      statsMap.set(
        String(item.date),
        {
          count: Number(item.count || 0),
          amount: Number(item.amount || 0),
          successfulCount: Number(
            item.successfulCount || 0
          ),
          successfulAmount: Number(
            item.successfulAmount || 0
          ),
        }
      );
    });

    const last7Days = getLast7Days().map((item) => {
      const stats = statsMap.get(item.key) || {
        count: 0,
        amount: 0,
        successfulCount: 0,
        successfulAmount: 0,
      };

      return {
        date: item.key,
        label: item.label,

        count: stats.count,

        amount: stats.amount,

        successfulCount:
          stats.successfulCount,

        successfulAmount:
          stats.successfulAmount,
      };
    });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      data: {
        overview: {
          totalPayments,
          successfulPayments,
          pendingPayments,
          failedPayments,
          cancelledPayments,
          expiredPayments,

          totalAmount: Number(
            totalAmount || 0
          ),

          successfulAmount: Number(
            successfulAmount || 0
          ),

          pendingAmount: Number(
            pendingAmount || 0
          ),

          failedAmount: Number(
            failedAmount || 0
          ),
        },

        today: {
          payments: todayPayments,

          successfulPayments:
            todaySuccessfulPayments,

          amount: Number(
            todayAmount || 0
          ),

          successfulAmount: Number(
            todaySuccessfulAmount || 0
          ),
        },

        vendors: {
          total: totalVendors,
          active: activeVendors,
          inactive: inactiveVendors,
        },

        last7Days,

        recentPayments,
      },
    });
  } catch (error) {
    console.error(
      "Get dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};