export interface AIGenerationRequest {
  prompt: string;
  style?: string;
  duration?: number;
  quality?: string;
  seed?: number;
  width?: number;
  height?: number;
  fps?: number;
  model?: string;
  controlnet?: boolean;
  init_image?: string;
}

export interface AIGenerationResponse {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  result_url?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  settings: ProjectSettings;
  generations: AIGenerationResponse[];
  created_at: string;
  updated_at: string;
}

export interface ProjectSettings {
  default_style: string;
  default_duration: number;
  default_quality: string;
  output_format: string;
  resolution: {
    width: number;
    height: number;
  };
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PythonBridgeRequest {
  action: string;
  params: Record<string, any>;
  timeout?: number;
}

export interface PythonBridgeResponse {
  success: boolean;
  data?: any;
  error?: string;
  execution_time?: number;
}