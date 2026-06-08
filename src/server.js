import app from "./app.js";
import dbConnect from "./config/database.config.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await dbConnect();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();