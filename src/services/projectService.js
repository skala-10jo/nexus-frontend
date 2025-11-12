import api from './api';

export const projectService = {
  /**
   * Get all projects for current user
   */
  async getAll() {
    return api.get('/projects');
  },

  /**
   * Get all projects for current user (alias)
   */
  async getUserProjects() {
    return api.get('/projects');
  },

  /**
   * Get project detail
   */
  async getProject(projectId) {
    return api.get(`/projects/${projectId}`);
  },

  /**
   * Create new project
   */
  async create(projectData) {
    return api.post('/projects', projectData);
  },

  /**
   * Create new project (alias)
   */
  async createProject(projectData) {
    return api.post('/projects', projectData);
  },

  /**
   * Update project
   */
  async update(projectId, projectData) {
    return api.put(`/projects/${projectId}`, projectData);
  },

  /**
   * Update project (alias)
   */
  async updateProject(projectId, projectData) {
    return api.put(`/projects/${projectId}`, projectData);
  },

  /**
   * Delete project (soft delete)
   */
  async delete(projectId) {
    return api.delete(`/projects/${projectId}`);
  },

  /**
   * Delete project (soft delete) (alias)
   */
  async deleteProject(projectId) {
    return api.delete(`/projects/${projectId}`);
  },

  /**
   * Get all schedules for a project
   */
  async getProjectSchedules(projectId) {
    return api.get(`/projects/${projectId}/schedules`);
  }
};

// Named exports for convenience
export const getUserProjects = projectService.getUserProjects.bind(projectService);
export const getProject = projectService.getProject.bind(projectService);
export const createProject = projectService.createProject.bind(projectService);
export const updateProject = projectService.updateProject.bind(projectService);
export const deleteProject = projectService.deleteProject.bind(projectService);
export const getProjectSchedules = projectService.getProjectSchedules.bind(projectService);
