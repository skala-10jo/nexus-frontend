import api from './api';

export const projectService = {
  /**
   * Get all projects for current user
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
  async createProject(projectData) {
    return api.post('/projects', projectData);
  },

  /**
   * Update project
   */
  async updateProject(projectId, projectData) {
    return api.put(`/projects/${projectId}`, projectData);
  },

  /**
   * Delete project (soft delete)
   */
  async deleteProject(projectId) {
    return api.delete(`/projects/${projectId}`);
  }
};
