import type { PartialMessage } from "@bufbuild/protobuf";
import EventEmitter from "node:events";
import { Join, Leave, Message } from "./proto/chat_pb.js";

const bus = new EventEmitter();

const messages = {
  message: Message,
  join: Join,
  leave: Leave,
};

export const emit = <T extends keyof typeof messages>(
  type: T,
  // @ts-expect-error There are type errors on `equal` methods
  detail: PartialMessage<InstanceType<(typeof messages)[T]>>
) => {
  bus.emit(type, new messages[type](detail).toBinary());
};

export const listen = <T extends keyof typeof messages>(
  type: T,
  callback: (message: InstanceType<(typeof messages)[T]>) => void
) => {
  const listener = (raw: Uint8Array) => {
    callback(messages[type].fromBinary(raw) as any);
  };
  bus.addListener(type, listener);
  return () => {
    bus.removeListener(type, listener);
  };
};
