#!/usr/bin/env python3
"""
Python Bridge for Olori Animate AI Engine
Handles communication between Node.js backend and Python AI modules
"""

import sys
import json
import traceback
import time
import os
from pathlib import Path

# Add current directory to Python path
sys.path.append(str(Path(__file__).parent))

from generators.video_generator import VideoGenerator
from utils.system_info import get_system_info
from utils.logger import setup_logger

logger = setup_logger(__name__)

class AIBridge:
    def __init__(self):
        self.video_generator = None
        self.initialized = False
        
    def initialize(self):
        """Initialize AI models and components"""
        try:
            logger.info("Initializing AI Bridge...")
            self.video_generator = VideoGenerator()
            self.initialized = True
            logger.info("AI Bridge initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize AI Bridge: {e}")
            return False

    def handle_request(self, request_data):
        """Handle incoming request from Node.js backend"""
        try:
            action = request_data.get('action')
            params = request_data.get('params', {})
            
            if action == 'health_check':
                return self.health_check()
            elif action == 'system_info':
                return self.get_system_info()
            elif action == 'list_models':
                return self.list_models()
            elif action == 'generate_animation':
                return self.generate_animation(params)
            else:
                return {
                    'success': False,
                    'error': f'Unknown action: {action}'
                }
                
        except Exception as e:
            logger.error(f"Error handling request: {e}")
            return {
                'success': False,
                'error': str(e),
                'traceback': traceback.format_exc()
            }

    def health_check(self):
        """Check if AI engine is healthy"""
        try:
            return {
                'success': True,
                'data': {
                    'status': 'healthy',
                    'initialized': self.initialized,
                    'timestamp': time.time(),
                    'python_version': sys.version,
                    'working_directory': str(Path.cwd())
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_system_info(self):
        """Get system information"""
        try:
            info = get_system_info()
            return {
                'success': True,
                'data': info
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def list_models(self):
        """List available AI models"""
        try:
            models = [
                'stable-video-diffusion',
                'animatediff',
                'text-to-video',
                'controlnet-animation'
            ]
            return {
                'success': True,
                'data': {
                    'models': models,
                    'count': len(models)
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def generate_animation(self, params):
        """Generate animation based on parameters"""
        try:
            if not self.initialized:
                if not self.initialize():
                    return {
                        'success': False,
                        'error': 'Failed to initialize AI engine'
                    }

            # Extract parameters
            generation_id = params.get('generation_id')
            prompt = params.get('prompt')
            model = params.get('model', 'stable-video-diffusion')
            
            if not prompt:
                return {
                    'success': False,
                    'error': 'Prompt is required'
                }

            logger.info(f"Starting animation generation for ID: {generation_id}")
            
            # Generate animation using the video generator
            # Remove conflicting params to avoid duplicate keyword arguments
            filtered_params = {k: v for k, v in params.items() 
                             if k not in ['generation_id', 'prompt', 'model']}
            result = self.video_generator.generate(
                prompt=prompt,
                model=model,
                generation_id=generation_id,
                **filtered_params
            )
            
            return {
                'success': True,
                'data': result
            }
            
        except Exception as e:
            logger.error(f"Animation generation failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'traceback': traceback.format_exc()
            }

def main():
    """Main function to handle communication with Node.js"""
    bridge = AIBridge()
    
    try:
        # Read request from stdin
        input_line = sys.stdin.readline().strip()
        if not input_line:
            print(json.dumps({
                'success': False,
                'error': 'No input received'
            }))
            sys.exit(1)
            
        # Parse request
        request_data = json.loads(input_line)
        
        # Handle request
        response = bridge.handle_request(request_data)
        
        # Send response
        print(json.dumps(response))
        sys.exit(0)
        
    except json.JSONDecodeError as e:
        print(json.dumps({
            'success': False,
            'error': f'Invalid JSON input: {e}'
        }))
        sys.exit(1)
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }))
        sys.exit(1)

if __name__ == '__main__':
    main()