import type { PartialMessage } from "@bufbuild/protobuf";
import EventEmitter from "node:events";
import { Message } from "./proto/chat_pb.js";

const broker = new EventEmitter();

export const emit = (message: PartialMessage<Message>) => {
  broker.emit("message", new Message(message).toBinary());
};

export const listen = (callback: (message: Message) => void) => {
  const listener = (raw: Uint8Array) => {
    callback(Message.fromBinary(raw));
  };
  broker.addListener("message", listener);
  return () => {
    broker.removeListener("message", listener);
  };
};
