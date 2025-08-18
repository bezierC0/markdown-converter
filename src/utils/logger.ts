export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel = LogLevel.INFO;

  setLevel(level: LogLevel) {
    this.currentLevel = level;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (level < this.currentLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
    };

    this.logs.push(entry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const logMethod = this.getConsoleMethod(level);
      const formattedMessage = `[${entry.timestamp.toISOString()}] ${message}`;
      
      if (context || error) {
        logMethod(formattedMessage, { context, error });
      } else {
        logMethod(formattedMessage);
      }
    }
  }

  private getConsoleMethod(level: LogLevel) {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      default:
        return console.log;
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return this.logs
      .map(log => {
        const levelName = LogLevel[log.level];
        const timestamp = log.timestamp.toISOString();
        let line = `[${timestamp}] ${levelName}: ${log.message}`;
        
        if (log.context) {
          line += `\nContext: ${JSON.stringify(log.context, null, 2)}`;
        }
        
        if (log.error) {
          line += `\nError: ${log.error.message}\nStack: ${log.error.stack}`;
        }
        
        return line;
      })
      .join('\n\n');
  }
}

// Create a singleton logger instance
export const logger = new Logger();

// Set development mode
if (process.env.NODE_ENV === 'development') {
  logger.setLevel(LogLevel.DEBUG);
}
