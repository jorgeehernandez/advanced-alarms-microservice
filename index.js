const express = require("express");
const app = express();
const http = require("./utils/http");
const PORT = 80;
const processAlarms = require("./modules/processAlarms");
const config = require("./cumulocity.json");

app.get("/alarms", async function({ query, headers }, res) {
  const httpInstance = http(headers.authorization);

  // Send credential error in case the request doesn't have it
  if (!httpInstance)
    return res.status(401).json({
      message: "No valid credentials"
    });

  const response = await processAlarms({ query, httpInstance });

  res.status(200).json({
    alarms: response
  });
});

app.get("/health", (_, res) => {
  res.json({
    status: "UP!",
    version: config.version
  });
});

app.listen(PORT, function() {
  console.log(`app running on port ${PORT}! at and /alarms`);
});
