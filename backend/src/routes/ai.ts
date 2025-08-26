import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AIService } from '../services/AIService';
import { AIGenerationRequest, APIResponse, AIGenerationResponse } from '../types';

const router = Router();

// In-memory storage for demo (replace with database in production)
const generations: Map<string, AIGenerationResponse> = new Map();

// Generate animation
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const request: AIGenerationRequest = req.body;
    
    // Validate request
    if (!request.prompt || request.prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      } as APIResponse);
    }

    // Create generation record
    const generationId = uuidv4();
    const generation: AIGenerationResponse = {
      id: generationId,
      status: 'queued',
      progress: 0,
      message: 'Request queued for processing',
      created_at: new Date().toISOString()
    };

    generations.set(generationId, generation);

    // Start AI generation asynchronously
    AIService.generateAnimation(generationId, request)
      .then((result) => {
        const updatedGeneration = generations.get(generationId);
        if (updatedGeneration) {
          updatedGeneration.status = 'completed';
          updatedGeneration.progress = 100;
          updatedGeneration.result_url = result.output_path;
          updatedGeneration.completed_at = new Date().toISOString();
          updatedGeneration.message = 'Animation generated successfully';
          generations.set(generationId, updatedGeneration);
        }
      })
      .catch((error) => {
        const updatedGeneration = generations.get(generationId);
        if (updatedGeneration) {
          updatedGeneration.status = 'failed';
          updatedGeneration.error = error.message;
          updatedGeneration.message = 'Generation failed';
          generations.set(generationId, updatedGeneration);
        }
      });

    res.json({
      success: true,
      data: generation,
      message: 'Generation started successfully'
    } as APIResponse<AIGenerationResponse>);

  } catch (error: any) {
    console.error('Error starting AI generation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    } as APIResponse);
  }
});

// Get generation status
router.get('/status/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const generation = generations.get(id);

    if (!generation) {
      return res.status(404).json({
        success: false,
        error: 'Generation not found'
      } as APIResponse);
    }

    res.json({
      success: true,
      data: generation
    } as APIResponse<AIGenerationResponse>);

  } catch (error: any) {
    console.error('Error getting generation status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    } as APIResponse);
  }
});

// List all generations
router.get('/generations', (req: Request, res: Response) => {
  try {
    const allGenerations = Array.from(generations.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      success: true,
      data: allGenerations
    } as APIResponse<AIGenerationResponse[]>);

  } catch (error: any) {
    console.error('Error listing generations:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    } as APIResponse);
  }
});

// Cancel generation
router.delete('/cancel/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const generation = generations.get(id);

    if (!generation) {
      return res.status(404).json({
        success: false,
        error: 'Generation not found'
      } as APIResponse);
    }

    if (generation.status === 'completed' || generation.status === 'failed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel completed or failed generation'
      } as APIResponse);
    }

    // Cancel the generation
    AIService.cancelGeneration(id);
    
    generation.status = 'failed';
    generation.error = 'Cancelled by user';
    generation.message = 'Generation cancelled';
    generations.set(id, generation);

    res.json({
      success: true,
      data: generation,
      message: 'Generation cancelled successfully'
    } as APIResponse<AIGenerationResponse>);

  } catch (error: any) {
    console.error('Error cancelling generation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    } as APIResponse);
  }
});

// Get available models
router.get('/models', (req: Request, res: Response) => {
  try {
    const models = [
      {
        id: 'stable-video-diffusion',
        name: 'Stable Video Diffusion',
        description: 'High-quality video generation from images',
        type: 'image-to-video'
      },
      {
        id: 'animatediff',
        name: 'AnimateDiff',
        description: 'Animate static images with smooth motion',
        type: 'image-to-video'
      },
      {
        id: 'text-to-video',
        name: 'Text to Video',
        description: 'Generate videos directly from text prompts',
        type: 'text-to-video'
      }
    ];

    res.json({
      success: true,
      data: models
    } as APIResponse);

  } catch (error: any) {
    console.error('Error getting models:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    } as APIResponse);
  }
});

export { router as aiRoutes };