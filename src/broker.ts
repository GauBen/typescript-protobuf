import EventEmitter from "node:events";
import { Message } from "./proto/chat_pb.js";

const broker = new EventEmitter();

/** Emits a message to all listeners. */
export const emit = (message: Message) => {
  // Convert the message to binary
  broker.emit("message", message.toBinary());
};

/** Triggers a callback on incoming messages. */
export const listen = (callback: (message: Message) => void) => {
  const listener = (raw: Uint8Array) => {
    // Parse the binary message
    callback(Message.fromBinary(raw));
  };
  broker.addListener("message", listener);
  return () => {
    broker.removeListener("message", listener);
  };
};
