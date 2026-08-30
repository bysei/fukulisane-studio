// Engine type definitions
export interface Engine { id: string; name: string; status: string; config: Record<string, unknown> }
export interface EngineConfig { name: string; description: string; version: string }
export type EngineStatus = 'idle' | 'running' | 'error' | 'stopped'