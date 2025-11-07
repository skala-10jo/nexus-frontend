import { defineStore } from 'pinia';
import { projectService } from '@/services/projectService';

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
  }),

  getters: {
    activeProjects: (state) => {
      return state.projects.filter(p => p.status === 'ACTIVE');
    },
    getProjectById: (state) => (id) => {
      return state.projects.find(p => p.id === id);
    },
  },

  actions: {
    async fetchProjects() {
      this.loading = true;
      this.error = null;

      try {
        const response = await projectService.getUserProjects();
        this.projects = response.data.data || response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getProjectDetail(projectId) {
      try {
        const response = await projectService.getProject(projectId);
        this.currentProject = response.data.data || response.data;
        return this.currentProject;
      } catch (error) {
        throw error;
      }
    },

    async createProject(projectData) {
      try {
        const response = await projectService.createProject(projectData);
        const newProject = response.data.data || response.data;
        this.projects.unshift(newProject);
        return newProject;
      } catch (error) {
        throw error;
      }
    },

    async updateProject(projectId, projectData) {
      try {
        const response = await projectService.updateProject(projectId, projectData);
        const updatedProject = response.data.data || response.data;

        const index = this.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
          this.projects[index] = updatedProject;
        }

        if (this.currentProject?.id === projectId) {
          this.currentProject = updatedProject;
        }

        return updatedProject;
      } catch (error) {
        throw error;
      }
    },

    async deleteProject(projectId) {
      try {
        await projectService.deleteProject(projectId);
        this.projects = this.projects.filter(p => p.id !== projectId);

        if (this.currentProject?.id === projectId) {
          this.currentProject = null;
        }
      } catch (error) {
        throw error;
      }
    },

    setCurrentProject(project) {
      this.currentProject = project;
    },

    clearCurrentProject() {
      this.currentProject = null;
    },
  },
});
