const { app, initialize } = require("./app");

const PORT = Number(process.env.PORT || process.env.APP_PORT || 5000);

initialize()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Digi-Tech Express server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize server:", error);
    process.exit(1);
  });
