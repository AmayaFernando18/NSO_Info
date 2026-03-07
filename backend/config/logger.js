import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Console transport with colors
const consoleTransport = new winston.transports.Console({
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
});

// Daily rotate file transport for all logs
const allLogsTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
});

// Daily rotate file transport for error logs only
const errorLogsTransport = new DailyRotateFile({
  level: 'error',
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
});

// Create logger instance
const logger = winston.createLogger({
  level: 'info',
  format: combine(errors({ stack: true }), timestamp(), logFormat),
  transports: [allLogsTransport, errorLogsTransport, consoleTransport],
  // Don't exit on handled exceptions
  exitOnError: false,
});

export default logger;
