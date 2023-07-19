import EventEmitter from "node:events";

const bus = new EventEmitter();

export const emit = (type: string, detail?: any) => {
  bus.emit(type, detail);
};

export const listen = (type: string, callback: (detail?: any) => void) => {
  bus.addListener(type, callback);
  return () => {
    bus.removeListener(type, callback);
  };
};
