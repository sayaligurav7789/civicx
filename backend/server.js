const cluster = require("cluster");
const os = require("os");
const process = require("process");

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log("======================================");
  console.log("Primary process started");
  console.log("Primary PID:", process.pid);
  console.log("======================================");

  // Initialize DB once
  const initDB = require("./db/init.js");
  initDB()
    .then(() => {
      console.log(" Users table initialized");

      // Fork workers after DB init
      console.log(`Forking ${numCPUs} worker processes...`);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
    })
    .catch((err) => {
      console.error(" DB initialization failed", err);
      process.exit(1); // Stop server if DB fails
    });

    

  cluster.on("online", (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`
    );
    cluster.fork();
  });

} else {
  // Worker process: start Express server
  const express = require("express");
  const cors = require("cors");
  const helmet = require("helmet");
  const cookieParser = require("cookie-parser");
  const rateLimit = require("express-rate-limit");
  const path = require("path");
  require("dotenv").config();

  const { xssSanitizer } = require("./middlewares/xssSanitizer");
  const { skipCSRFForRoutes, csrfErrorHandler } = require("./middlewares/csrfProtection");
  const errorHandler = require("./middlewares/errorHandler.js");

  const app = express();

  // === Middlewares ===
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "https://civix-phi.vercel.app/login",
        "https://civix-phi.vercel.app/signup",
      ],
      credentials: true,
    })
  );
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(xssSanitizer);

  const csrfSkipRoutes = ["/api/contributors", "/api-docs", "/api/auth/webhook"];
  app.use(skipCSRFForRoutes(csrfSkipRoutes));

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
  });
  app.use(limiter);

  // === Routes ===
  app.use("/api/auth", require("./routes/auth.js"));
  app.use("/api/issues", require("./routes/issues.js"));
  app.use("/api/profile", require("./routes/profileRoutes.js"));
  app.use("/api/contributors", require("./routes/contributions.js"));

  // CSRF token endpoint
  app.get("/api/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  // === Swagger Docs ===
  const { swaggerUi, specs } = require("./config/swagger.js");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

  // === Error Handlers ===
  app.use(csrfErrorHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Worker PID:${process.pid} running on http://localhost:${PORT}`);
  });
}