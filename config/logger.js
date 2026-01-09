// logger.js
import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

/* 1.  choose format per environment */
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, ...meta }) =>
    `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`
  )
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }), // capture Error stack
  json()
);

/* 2.  create logger */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console({ handleExceptions: true }),
    // optional daily file (uncomment if wanted)
    // new winston.transports.DailyRotateFile({
    //   filename: path.join('logs', '%DATE%-combined.log'),
    //   datePattern: 'YYYY-MM-DD',
    //   maxSize: '20m',
    //   maxFiles: '14d'
    // })
  ],
  exitOnError: false
});

/* 3.  create a stream object for Morgan / HTTP logging */
logger.stream = {
  write: (message) => logger.http(message.trim())
};

/* 4.  export so you can use:
      logger.error('msg', meta)
      logger.warn('msg', meta)
      logger.info('msg', meta)
      logger.http('msg', meta)
      logger.verbose('msg', meta)
      logger.debug('msg', meta)
      logger.silly('msg', meta)
*/
export default logger;