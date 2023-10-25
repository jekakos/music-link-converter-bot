import winston from 'winston';
import 'source-map-support/register.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'bot' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({
      filename: 'error.log',
      options: { level: 'error' },
    }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  //TODO: do it using IConfig injection
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

// Global error handler function
const errorHandler = (error: Error) => {
  // Log the error using Winston logger
  //console.log('Error: ', error);
  logger.error(`Uncaught Exception: ${error.message} ${error.stack}`, {
    error,
  });

  // Optionally perform additional error handling or cleanup tasks

  // Terminate the application gracefully
  //process.exit(1);
};

// Set up error event listeners

process.on('uncaughtException', errorHandler);
process.on('unhandledRejection', (reason, promise) => {
  //console.log('Trace:', parse(reason as Error));
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);

  // Convert unhandled promise rejections to Error objects
  const error = reason instanceof Error ? reason : new Error(String(reason));
  if (error) errorHandler(error);
});

export { logger };
