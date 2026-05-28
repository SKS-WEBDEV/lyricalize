type LogLevel = "info" | "warn" | "error" | "debug";

let isEnabled = true;

class Logger {
  setEnabled(value: boolean) {
    isEnabled = value;
  }

  private format(label: string, message: string) {
    return `%c[${label}] %c${message}`;
  }

  private styles(color: string) {
    return [
      `color: white; background: ${color}; padding: 2px 6px; border-radius: 4px; font-weight: bold`,
      "color: inherit;"
    ];
  }

  private shouldLog(level: LogLevel) {
    return true;
  }

  info(scope: string, message: string, data?: any) {
    if (!this.shouldLog('info')) return;
    console.log(
      this.format(scope, message),
      ...this.styles("#3b82f6"),
      data || ""
    );
  }

  warn(scope: string, message: string, data?: any) {
    if (!this.shouldLog('warn')) return;
    console.warn(
      this.format(scope, message),
      ...this.styles("#f59e0b"),
      data || ""
    );
  }

  error(scope: string, message: string, data?: any) {
    console.error(
      this.format(scope, message),
      ...this.styles("#ef4444"),
      data || ""
    );
  }

  debug(scope: string, message: string, data?: any) {
    if (!this.shouldLog('debug')) return;
    console.log(
      this.format(scope, message),
      ...this.styles("#8b5cf6"),
      data || ""
    );
  }

  group(scope: string, fn: () => void) {
    console.group(`🔽 ${scope}`);
    fn();
    console.groupEnd();
  }
}

export const logger = new Logger();