import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import paymentRoutes from "./routes/payment.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";


const app = express();

const frontendOrigins = (process.env.FRONTEND_URL || process.env.FRONTEND_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean);


const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  ...frontendOrigins,
]);

app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
  ],

  optionsSuccessStatus: 204,
})
);

app.use(express.json({
  limit: "1mb",
  verify: (req, res, buf) => {
    req.rawBody = Buffer.from(buf);
  },
})
);

app.use(express.urlencoded({ extended: true, limit: "1mb" })
);


const healthHandler = (req, res) => {

  res.status(200).json({
    success: true,
    message: "Payment backend is running",
    data: {
      environment: process.env.PAYKAR_ENVIRONMENT || "production",
    },

  });
};


app.get("/health", healthHandler);
app.get("/api/health", healthHandler);
app.use("/api/payments", paymentRoutes);
app.use("/api/webhooks", webhookRoutes);

app.use(notFoundHandler);
app.use(errorHandler);


export default app;