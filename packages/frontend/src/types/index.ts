export interface User { id: string; email: string; name: string | null; organization: string | null; plan: string | null; role: string; }

export interface Opportunity { id: string; title: string; county: string; state: string; volume: number; growthRate: number; confidence: number; }

export interface Alert { id: string; title: string; message: string; severity: "critical" | "warning" | "info"; createdAt: string; }

export interface MonitoringStatus { status: "healthy" | "degraded" | "down"; timestamp: string; }

export interface MonitoringSummary { uptime: string; latency: number; requests: number; errors: number; }
