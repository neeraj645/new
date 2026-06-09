import app from "./app.js";
import prisma from "./config/prisma.config.js";

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    // Connect Database
    await prisma.$connect();
    console.log("✅ PostgreSQL connected successfully");

    // Start Express Server
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Stop accepting new requests
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      console.log("✅ HTTP server closed");
    }

    // Close Prisma connection pool
    await prisma.$disconnect();
    console.log("✅ PostgreSQL connection closed");

    process.exit(0);

  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

// Handle Ctrl + C
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle Docker, PM2, Kubernetes, etc.
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle unexpected errors
process.on("unhandledRejection", async (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  await gracefulShutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", async (error) => {
  console.error("❌ Uncaught Exception:", error);
  await gracefulShutdown("UNCAUGHT_EXCEPTION");
});

startServer();