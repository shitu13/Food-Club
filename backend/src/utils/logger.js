import { env } from "../config/env.js";

const serialize = (meta) => {
  if (meta instanceof Error) {
    return { name: meta.name, message: meta.message, stack: meta.stack };
  }
  return meta;
};

function write(level, message, meta) {
  if (env.NODE_ENV === "test") return;
  const output = level === "error" ? console.error : console.log;
  if (env.isProduction) {
    output(JSON.stringify({ level, time: new Date().toISOString(), message, meta: serialize(meta) }));
  } else {
    output(`[${level}] ${message}`, meta === undefined ? "" : serialize(meta));
  }
}

const logger = {
  info: (message, meta) => write("info", message, meta),
  warn: (message, meta) => write("warn", message, meta),
  error: (message, meta) => write("error", message, meta),
};

export default logger;
