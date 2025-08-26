import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { AIGenerationRequest, PythonBridgeRequest, PythonBridgeResponse } from '../types';
import { WebSocketServer } from 'ws';

class AIServiceClass {
  private pythonProcess: ChildProcess | null = null;
  private isInitialized = false;
  private activeGenerations = new Map<string, ChildProcess>();
  private aiEnginePath: string;
  private wss: WebSocketServer | null = null;

  constructor() {
    this.aiEnginePath = path.join(__dirname, '../../../ai_engine');
  }

  async initialize(): Promise<void> {
    try {
      console.log('🔧 Initializing AI Service...');
      
      // Check if Python is available
      await this.checkPythonAvailability();
      
      // Check if AI engine exists
      await this.checkAIEngine();
      
      // Test Python bridge communication
      await this.testPythonBridge();
      
      this.isInitialized = true;
      console.log('✅ AI Service initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize AI Service:', error);
      throw error;
    }
  }

  private async checkPythonAvailability(): Promise<void> {
    return new Promise((resolve, reject) => {
      const pythonCheck = spawn('python3', ['--version']);
      
      pythonCheck.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Python3 is available');
          resolve();
        } else {
          reject(new Error('Python3 is not available. Please install Python 3.8 or higher.'));
        }
      });
      
      pythonCheck.on('error', () => {
        reject(new Error('Python3 is not available. Please install Python 3.8 or higher.'));
      });
    });
  }

  private async checkAIEngine(): Promise<void> {
    try {
      await fs.access(this.aiEnginePath);
      console.log('✅ AI Engine directory found');
    } catch (error) {
      console.log('⚠️ AI Engine directory not found, will be created');
    }
  }

  private async testPythonBridge(): Promise<void> {
    try {
      const response = await this.callPythonBridge({
        action: 'health_check',
        params: {},
        timeout: 5000
      });
      
      if (response.success) {
        console.log('✅ Python bridge communication test successful');
      } else {
        throw new Error('Python bridge communication test failed');
      }
    } catch (error) {
      console.log('⚠️ Python bridge test failed, will initialize on first use');
    }
  }

  async generateAnimation(generationId: string, request: AIGenerationRequest): Promise<{ output_path: string }> {
    if (!this.isInitialized) {
      throw new Error('AI Service not initialized');
    }

    try {
      console.log(`🎬 Starting animation generation for ID: ${generationId}`);
      
      // Broadcast generation start
      this.broadcastProgress(generationId, 0, 'Starting generation...');

      // Prepare generation parameters
      const generationParams = {
        generation_id: generationId,
        prompt: request.prompt,
        style: request.style || 'realistic',
        duration: request.duration || 4,
        quality: request.quality || 'standard',
        width: request.width || 512,
        height: request.height || 512,
        fps: request.fps || 24,
        model: request.model || 'stable-video-diffusion',
        seed: request.seed || Math.floor(Math.random() * 1000000),
        controlnet: request.controlnet || false,
        init_image: request.init_image
      };

      // Call Python AI engine
      const response = await this.callPythonBridge({
        action: 'generate_animation',
        params: generationParams,
        timeout: 300000 // 5 minutes timeout
      });

      if (!response.success) {
        throw new Error(response.error || 'Animation generation failed');
      }

      console.log(`✅ Animation generation completed for ID: ${generationId}`);
      this.broadcastProgress(generationId, 100, 'Generation completed');

      return {
        output_path: response.data.output_path
      };

    } catch (error: any) {
      console.error(`❌ Animation generation failed for ID: ${generationId}:`, error);
      this.broadcastProgress(generationId, 0, `Generation failed: ${error.message}`);
      throw error;
    }
  }

  async cancelGeneration(generationId: string): Promise<void> {
    try {
      const process = this.activeGenerations.get(generationId);
      if (process) {
        process.kill('SIGTERM');
        this.activeGenerations.delete(generationId);
        console.log(`🛑 Cancelled generation: ${generationId}`);
      }
    } catch (error) {
      console.error(`❌ Failed to cancel generation ${generationId}:`, error);
    }
  }

  private async callPythonBridge(request: PythonBridgeRequest): Promise<PythonBridgeResponse> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // Spawn Python process
      const pythonProcess = spawn('python3', [
        path.join(this.aiEnginePath, 'bridge.py')
      ]);

      let outputData = '';
      let errorData = '';

      // Send request to Python process
      pythonProcess.stdin.write(JSON.stringify(request) + '\n');
      pythonProcess.stdin.end();

      // Collect output
      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      // Handle process completion
      pythonProcess.on('close', (code) => {
        const executionTime = Date.now() - startTime;
        
        if (code === 0) {
          try {
            const response = JSON.parse(outputData.trim()) as PythonBridgeResponse;
            response.execution_time = executionTime;
            resolve(response);
          } catch (parseError) {
            reject(new Error(`Failed to parse Python response: ${parseError}`));
          }
        } else {
          reject(new Error(`Python process exited with code ${code}: ${errorData}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to spawn Python process: ${error.message}`));
      });

      // Set timeout
      if (request.timeout) {
        setTimeout(() => {
          pythonProcess.kill('SIGTERM');
          reject(new Error('Python bridge request timeout'));
        }, request.timeout);
      }
    });
  }

  setWebSocketServer(wss: WebSocketServer): void {
    this.wss = wss;
  }

  private broadcastProgress(generationId: string, progress: number, message: string): void {
    const progressMessage = {
      type: 'ai_progress',
      data: {
        generation_id: generationId,
        progress,
        message,
        timestamp: Date.now()
      }
    };

    // Broadcast to all connected WebSocket clients
    if (this.wss) {
      this.wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify(progressMessage));
        }
      });
    }
  }

  // Utility methods
  async getModels(): Promise<string[]> {
    try {
      const response = await this.callPythonBridge({
        action: 'list_models',
        params: {},
        timeout: 10000
      });
      
      return response.success ? response.data.models : [];
    } catch (error) {
      console.error('Failed to get models:', error);
      return ['stable-video-diffusion', 'animatediff', 'text-to-video'];
    }
  }

  async getSystemInfo(): Promise<any> {
    try {
      const response = await this.callPythonBridge({
        action: 'system_info',
        params: {},
        timeout: 5000
      });
      
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to get system info:', error);
      return null;
    }
  }
}

// Export singleton instance
export const AIService = new AIServiceClass();