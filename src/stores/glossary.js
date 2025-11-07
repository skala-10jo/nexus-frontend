import { defineStore } from 'pinia';
import { glossaryService } from '@/services/glossaryService';

export const useGlossaryStore = defineStore('glossary', {
  state: () => ({
    terms: [],
    currentTerm: null,
    extractionJob: null,
    pollingInterval: null,
    pagination: {
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    },
    hasMore: false,
    loading: false,
    extracting: false,
    error: null,
  }),

  getters: {
    verifiedTerms: (state) => {
      return state.terms.filter(t => t.isVerified);
    },
    unverifiedTerms: (state) => {
      return state.terms.filter(t => !t.isVerified);
    },
    termsByStatus: (state) => (status) => {
      return state.terms.filter(t => t.status === status);
    },
    extractionProgress: (state) => {
      return state.extractionJob?.progress || 0;
    },
    isExtractionComplete: (state) => {
      return state.extractionJob?.status === 'COMPLETED';
    },
    isExtractionFailed: (state) => {
      return state.extractionJob?.status === 'FAILED';
    },
  },

  actions: {
    async startExtraction(documentId) {
      this.extracting = true;
      this.error = null;

      try {
        const response = await glossaryService.startExtraction(documentId);
        this.extractionJob = response.data.data || response.data;

        // Start polling for job status
        this.startPolling(this.extractionJob.id);

        return this.extractionJob;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.extracting = false;
      }
    },

    async getExtractionStatus(jobId) {
      try {
        const response = await glossaryService.getExtractionStatus(jobId);
        this.extractionJob = response.data.data || response.data;
        return this.extractionJob;
      } catch (error) {
        throw error;
      }
    },

    startPolling(jobId) {
      this.stopPolling();

      this.pollingInterval = setInterval(async () => {
        try {
          await this.getExtractionStatus(jobId);

          if (
            this.extractionJob.status === 'COMPLETED' ||
            this.extractionJob.status === 'FAILED'
          ) {
            this.stopPolling();
          }
        } catch (error) {
          console.error('Polling error:', error);
          this.stopPolling();
        }
      }, 5000); // Poll every 5 seconds
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },

    async fetchAllTerms(filters = {}) {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: 0,
          size: this.pagination.size,
          sort: 'createdAt,desc',
          ...filters,
        };

        const response = await glossaryService.getAllTerms(params);
        const data = response.data.data || response.data;

        this.terms = data.content || data;
        this.pagination = {
          page: data.number || 0,
          size: data.size || params.size,
          totalElements: data.totalElements || data.length || 0,
          totalPages: data.totalPages || 1,
        };
        this.hasMore = this.pagination.page < this.pagination.totalPages - 1;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTerms(projectId, filters = {}) {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: 0,
          size: this.pagination.size,
          sort: 'createdAt,desc',
          ...filters,
        };

        const response = await glossaryService.getTermsByProject(projectId, params);
        const data = response.data.data || response.data;

        this.terms = data.content || data;
        this.pagination = {
          page: data.number || 0,
          size: data.size || params.size,
          totalElements: data.totalElements || data.length || 0,
          totalPages: data.totalPages || 1,
        };
        this.hasMore = this.pagination.page < this.pagination.totalPages - 1;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async searchAllTerms(query, filters = {}) {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: 0,
          size: this.pagination.size,
          sort: 'createdAt,desc',
          ...filters,
        };

        const response = await glossaryService.searchAllTerms(query, params);
        const data = response.data.data;

        this.terms = data.content || data;
        this.pagination = {
          page: data.number || 0,
          size: data.size || params.size,
          totalElements: data.totalElements || data.length || 0,
          totalPages: data.totalPages || 1,
        };
        this.hasMore = this.pagination.page < this.pagination.totalPages - 1;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async searchTerms(projectId, query, filters = {}) {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: 0,
          size: this.pagination.size,
          sort: 'createdAt,desc',
          ...filters,
        };

        const response = await glossaryService.searchTerms(projectId, query, params);
        const data = response.data.data;

        this.terms = data.content || data;
        this.pagination = {
          page: data.number || 0,
          size: data.size || params.size,
          totalElements: data.totalElements || data.length || 0,
          totalPages: data.totalPages || 1,
        };
        this.hasMore = this.pagination.page < this.pagination.totalPages - 1;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loadMore(projectId) {
      if (!this.hasMore || this.loading) return;

      this.loading = true;
      try {
        const params = {
          page: this.pagination.page + 1,
          size: this.pagination.size,
          sort: 'createdAt,desc',
        };

        const response = await glossaryService.getTermsByProject(projectId, params);
        const data = response.data.data;

        this.terms.push(...(data.content || []));
        this.pagination = {
          page: data.number || params.page,
          size: data.size || params.size,
          totalElements: data.totalElements || this.terms.length,
          totalPages: data.totalPages || 1,
        };
        this.hasMore = this.pagination.page < this.pagination.totalPages - 1;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async getTermDetail(termId) {
      try {
        const response = await glossaryService.getTermDetail(termId);
        this.currentTerm = response.data.data || response.data;
        return this.currentTerm;
      } catch (error) {
        throw error;
      }
    },

    async createTerm(termData) {
      try {
        const response = await glossaryService.createTerm(termData);
        const newTerm = response.data.data || response.data;
        this.terms.unshift(newTerm);
        this.pagination.totalElements++;
        return newTerm;
      } catch (error) {
        throw error;
      }
    },

    async updateTerm(termId, termData) {
      try {
        const response = await glossaryService.updateTerm(termId, termData);
        const updatedTerm = response.data.data || response.data;

        const index = this.terms.findIndex(t => t.id === termId);
        if (index !== -1) {
          this.terms[index] = updatedTerm;
        }

        if (this.currentTerm?.id === termId) {
          this.currentTerm = updatedTerm;
        }

        return updatedTerm;
      } catch (error) {
        throw error;
      }
    },

    async deleteTerm(termId) {
      try {
        await glossaryService.deleteTerm(termId);
        this.terms = this.terms.filter(t => t.id !== termId);
        this.pagination.totalElements--;

        if (this.currentTerm?.id === termId) {
          this.currentTerm = null;
        }
      } catch (error) {
        throw error;
      }
    },

    async verifyTerm(termId) {
      try {
        const response = await glossaryService.verifyTerm(termId);
        const verifiedTerm = response.data.data || response.data;

        const index = this.terms.findIndex(t => t.id === termId);
        if (index !== -1) {
          this.terms[index] = verifiedTerm;
        }

        if (this.currentTerm?.id === termId) {
          this.currentTerm = verifiedTerm;
        }

        return verifiedTerm;
      } catch (error) {
        throw error;
      }
    },

    setCurrentTerm(term) {
      this.currentTerm = term;
    },

    clearCurrentTerm() {
      this.currentTerm = null;
    },

    clearExtractionJob() {
      this.stopPolling();
      this.extractionJob = null;
    },

    resetState() {
      this.stopPolling();
      this.terms = [];
      this.currentTerm = null;
      this.extractionJob = null;
      this.pagination = {
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
      };
      this.hasMore = false;
      this.loading = false;
      this.extracting = false;
      this.error = null;
    },
  },
});
