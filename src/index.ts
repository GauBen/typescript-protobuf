import express from "express";
import { fileURLToPath } from "node:url";
import * as broker from "./broker.js";
import { Message } from "./proto/chat_pb.js";

const app = express();

// Post route to receive incoming messages
app.post("/post", express.json(), (req, res) => {
  try {
    // Use Protobuf to validate the message
    const message = Message.fromJson(req.body);

    broker.emit(message);
    res.sendStatus(204);
  } catch (error) {
    // Protobuf runtime will throw an error if the message is invalid
    if (error instanceof Error) res.status(400).end(error.message);
    else res.sendStatus(500);
  }
});

// SSE route to broadcast messages to clients
app.get("/messages", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");

  const removeListener = broker.listen((message) => {
    // `message` is guaranteed to have all the props we need
    res.write(`data: ${JSON.stringify(message)}\r\n\r\n`);
  });

  req.on("close", removeListener);
});

app.get("*", express.static(fileURLToPath(new URL("public", import.meta.url))));

app.listen(3000, () => {
  console.log("Server running on port 3000!");
});
