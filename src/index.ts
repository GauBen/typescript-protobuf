import express from "express";
import { fileURLToPath } from "node:url";
import * as bus from "./bus.js";
import { Leave, Message } from "./proto/chat_pb.js";

const app = express();

app.get("/messages", (req, res) => {
  if (!("username" in req.query)) {
    res.sendStatus(400);
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");

  const cleanups = [
    bus.listen("message", (message) => {
      res.write(`data: ${JSON.stringify(message)}\r\n\r\n`);
    }),
    bus.listen("join", ({ username }) => {
      res.write(`event: join\r\ndata: ${username}\r\n\r\n`);
    }),
    bus.listen("leave", ({ username }) => {
      res.write(`event: leave\r\ndata: ${username}\r\n\r\n`);
    }),
  ];

  const username = String(req.query.username);
  bus.emit("join", { username });

  req.on("close", () => {
    for (const cleanup of cleanups) cleanup();
    bus.emit("leave", { username });
  });
});

app.post("/send", express.json(), (req, res) => {
  try {
    // Use protobuf to validate the message
    const message = Message.fromJson(req.body);

    bus.emit("message", message);
    console.log(message.username + ":", message.body);
    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) res.status(400).end(error.message);
    else res.sendStatus(500);
  }
});

app.get("*", express.static(fileURLToPath(new URL("public", import.meta.url))));

app.listen(3000, () => {
  console.log("Server running on port 3000!");
});
