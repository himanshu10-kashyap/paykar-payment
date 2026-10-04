import "dotenv/config";
import app from "./app.js";
import sequelize from "./config/database.js";
import "./models/index.js";


const PORT = Number(process.env.PORT);


const startServer = async () => {

  try {
    await sequelize.authenticate();

    await sequelize.sync({ alter: false });

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌎 Paykar Environment: ${process.env.PAYKAR_ENVIRONMENT || "sandbox"}`);
      console.log(`🔗 API: http://localhost:${PORT}`);
      console.log(`❤️ Health: http://localhost:${PORT}/health`);
      console.log(`💳 Payment API: http://localhost:${PORT}/api/payments`);
      console.log(`🔔 Webhook: http://localhost:${PORT}/api/webhooks/paykar`);
    }
    );

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.error(`Stop the process using port ${PORT} or change PORT in .env`);
        process.exit(1);
      }
      console.error("❌ Server error:", error);
      process.exit(1);
    }
    );

    const shutdown = async (signal) => {

      console.log(`\n${signal} received, shutting down...`);

      server.close(async () => {
        try {
          await sequelize.close();
          console.log("✅ MySQL connection closed");
          console.log("✅ HTTP server closed");
          process.exit(0);
        } catch (error) {
          console.error("❌ Shutdown error:", error);
          process.exit(1);
        }

      }
      );
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};


startServer();