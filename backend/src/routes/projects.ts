import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Project, APIResponse, ProjectSettings } from '../types';

const router = Router();

// In-memory storage for demo (replace with database in production)
const projects: Map<string, Project> = new Map();

// Create default project settings
const createDefaultSettings = (): ProjectSettings => ({
  default_style: 'realistic',
  default_duration: 4,
  default_quality: 'standard',
  output_format: 'mp4',
  resolution: {
    width: 512,
    height: 512
  }
});

// Create new project
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      } as APIResponse);
    }

    const projectId = uuidv4();
    const project: Project = {
      id: projectId,
      name: name.trim(),
      description: description?.trim() || '',
      settings: createDefaultSettings(),
      generations: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    projects.set(projectId, project);

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    } as APIResponse<Project>);

  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    } as APIResponse);
  }
});

// Get all projects
router.get('/', (req: Request, res: Response) => {
  try {
    const allProjects = Array.from(projects.values())
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    res.json({
      success: true,
      data: allProjects
    } as APIResponse<Project[]>);

  } catch (error: any) {
    console.error('Error getting projects:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    } as APIResponse);
  }
});

// Get project by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = projects.get(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      } as APIResponse);
    }

    res.json({
      success: true,
      data: project
    } as APIResponse<Project>);

  } catch (error: any) {
    console.error('Error getting project:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    } as APIResponse);
  }
});

// Update project
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = projects.get(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      } as APIResponse);
    }

    const { name, description, settings } = req.body;

    // Update project fields
    if (name !== undefined) {
      if (name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Project name cannot be empty'
        } as APIResponse);
      }
      project.name = name.trim();
    }

    if (description !== undefined) {
      project.description = description.trim();
    }

    if (settings !== undefined) {
      project.settings = { ...project.settings, ...settings };
    }

    project.updated_at = new Date().toISOString();
    projects.set(id, project);

    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    } as APIResponse<Project>);

  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    } as APIResponse);
  }
});

// Delete project
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = projects.get(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      } as APIResponse);
    }

    projects.delete(id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    } as APIResponse);

  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    } as APIResponse);
  }
});

// Get project statistics
router.get('/:id/stats', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = projects.get(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      } as APIResponse);
    }

    const stats = {
      total_generations: project.generations.length,
      completed_generations: project.generations.filter(g => g.status === 'completed').length,
      failed_generations: project.generations.filter(g => g.status === 'failed').length,
      pending_generations: project.generations.filter(g => g.status === 'queued' || g.status === 'processing').length,
      total_duration: project.generations
        .filter(g => g.status === 'completed')
        .reduce((sum, g) => sum + (g.completed_at ? 
          (new Date(g.completed_at).getTime() - new Date(g.created_at).getTime()) / 1000 : 0), 0),
      created_at: project.created_at,
      updated_at: project.updated_at
    };

    res.json({
      success: true,
      data: stats
    } as APIResponse);

  } catch (error: any) {
    console.error('Error getting project stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    } as APIResponse);
  }
});

export { router as projectRoutes };