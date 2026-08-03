const { app, initialize } = require("./app");

// Default 5001: macOS AirPlay Receiver commonly occupies 5000 and causes a silent exit.
const PORT = Number(process.env.PORT || process.env.APP_PORT || 5001);

initialize()
  .then(() => {
    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Digi-Tech Express server listening on port ${PORT}`);
    });
    server.on("error", (error) => {
      // eslint-disable-next-line no-console
      console.error(`Failed to bind port ${PORT}:`, error.message);
      process.exit(1);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize server:", error);
    process.exit(1);
  });
