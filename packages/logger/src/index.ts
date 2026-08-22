import { createLogger, format, transports, Logger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import chalk from "chalk";
import { format as dateFnsFormat } from "date-fns";
import path from "node:path";

const { combine, timestamp, printf, errors, json } = format;

const getLogDir = (): string => {
  const envPath = process.env.LOG_FILE_PATH || process.env.LOG_DIR;
  if (envPath) {
    if (envPath.endsWith(".log")) {
      return path.dirname(envPath);
    }
    return envPath;
  }
  return "logs";
};

const LOG_DIR = getLogDir();

// Console format with colors/emojis
const consoleFormat = printf(
  ({ level, message, timestamp, stack, context, ...meta }) => {
    const styles: Record<
      string,
      { emoji: string; color: (msg: string) => string }
    > = {
      error: { emoji: "❌", color: chalk.red.bold },
      warn: { emoji: "⚠️", color: chalk.yellow.bold },
      info: { emoji: "ℹ️", color: chalk.cyan.bold },
      http: { emoji: "⇄", color: chalk.magenta.bold },
      verbose: { emoji: "›", color: chalk.blue },
      debug: { emoji: "⚙️", color: chalk.green },
      silly: { emoji: "∼", color: chalk.gray },
    };

    const style = styles[level] || { emoji: "📝", color: chalk.white };

    const time = chalk.dim(timestamp);
    const lvl = style.color(level.toUpperCase().padEnd(7));
    const emoji = style.emoji;

    // NestJS-style context formatting: [Context] in yellow
    const ctx = context ? chalk.yellow(`[${context}] `) : "";

    const metaString =
      meta && Object.keys(meta).length
        ? "\n" + chalk.blue(JSON.stringify(meta, null, 3))
        : "";

    // Layout: Emoji | Timestamp | Level | [Context] | Message/Stack | Meta
    return `${emoji} ${time} ${lvl} ${ctx}${stack || message}${metaString}`;
  },
);

const errorFormatter = format((info) => {
  if (info instanceof Error) {
    return Object.assign(
      {
        message: info.message,
        stack: info.stack,
        name: info.name,
      },
      info
    );
  }
  if (info.error instanceof Error) {
    info.stack = info.error.stack;
    info.message = info.message || info.error.message;
  }
  return info;
});

export class AppLogger {
  private static instance: Logger;
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private static init(): Logger {
    if (!AppLogger.instance) {
      const logDir = getLogDir();
      AppLogger.instance = createLogger({
        level: process.env.LOG_LEVEL || "debug",
        exitOnError: false,
        format: combine(
          errors({ stack: true }),
          errorFormatter(),
          timestamp({
            format: () => dateFnsFormat(new Date(), "yyyy-MM-dd HH:mm:ss.SSS"),
          }),
        ),
        transports: [
          new transports.Console({
            format: combine(consoleFormat),
          }),
          new DailyRotateFile({
            dirname: logDir,
            filename: "app-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxFiles: "14d",
            maxSize: "5m",
            format: combine(errorFormatter(), json({ space: 2 })),
          }),
        ],
        exceptionHandlers: [
          new DailyRotateFile({
            dirname: logDir,
            filename: "exceptions-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            format: combine(errorFormatter(), json({ space: 2 })),
          }),
        ],
        rejectionHandlers: [
          new DailyRotateFile({
            dirname: logDir,
            filename: "rejections-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            format: combine(errorFormatter(), json({ space: 2 })),
          }),
        ],
      });
    }
    return this.instance;
  }

  static get logger(): Logger {
    return this.init();
  }

  // ==========================================
  // INSTANCE METHODS (Contextual)
  // ==========================================
  public info(msg: string, meta: any = {}) {
    AppLogger.init().info(msg, { ...meta, context: this.context });
  }
  public warn(msg: string, meta: any = {}) {
    AppLogger.init().warn(msg, { ...meta, context: this.context });
  }
  public debug(msg: string, meta: any = {}) {
    AppLogger.init().debug(msg, { ...meta, context: this.context });
  }
  public error(msg: string | Error, meta: any = {}) {
    if (msg instanceof Error) {
      AppLogger.init().error(msg.message, {
        ...meta,
        context: this.context,
        stack: msg.stack,
      });
    } else {
      AppLogger.init().error(msg, { ...meta, context: this.context });
    }
  }

  // ==========================================
  // STATIC METHODS (Global)
  // ==========================================
  static info(msg: string, meta?: any) {
    this.init().info(msg, meta);
  }
  static warn(msg: string, meta?: any) {
    this.init().warn(msg, meta);
  }
  static debug(msg: string, meta?: any) {
    this.init().debug(msg, meta);
  }
  static error(msg: string | Error, meta?: any) {
    if (msg instanceof Error) {
      this.init().error(msg.message, { ...meta, stack: msg.stack });
    } else {
      this.init().error(msg, meta);
    }
  }
}

export default AppLogger;
