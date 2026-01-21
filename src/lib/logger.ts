import { dev } from '$app/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
	level: LogLevel;
	message: string;
	timestamp: string;
	data?: unknown;
}

function formatLog(entry: LogEntry): string {
	const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
	return entry.data ? `${base} ${JSON.stringify(entry.data)}` : base;
}

function log(level: LogLevel, message: string, data?: unknown): void {
	// Only log in development or for errors/warnings in production
	if (!dev && level === 'debug') return;
	if (!dev && level === 'info') return;

	const entry: LogEntry = {
		level,
		message,
		timestamp: new Date().toISOString(),
		data
	};

	const formatted = formatLog(entry);

	switch (level) {
		case 'debug':
		case 'info':
			// In production, these would go to a logging service
			if (dev) console.log(formatted);
			break;
		case 'warn':
			console.warn(formatted);
			break;
		case 'error':
			console.error(formatted);
			break;
	}
}

export const logger = {
	debug: (message: string, data?: unknown) => log('debug', message, data),
	info: (message: string, data?: unknown) => log('info', message, data),
	warn: (message: string, data?: unknown) => log('warn', message, data),
	error: (message: string, data?: unknown) => log('error', message, data)
};
