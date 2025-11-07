import api from './api';

export const glossaryService = {
  /**
   * Start glossary term extraction from a document
   */
  async startExtraction(documentId) {
    return api.post(`/glossary/extract/${documentId}`);
  },

  /**
   * Get extraction job status
   */
  async getExtractionStatus(jobId) {
    return api.get(`/glossary/extraction/${jobId}`);
  },

  /**
   * Get all glossary terms for the current user (no project filter)
   */
  async getAllTerms(params = {}) {
    return api.get('/glossary', { params });
  },

  /**
   * Get glossary terms by project with pagination
   */
  async getTermsByProject(projectId, params = {}) {
    return api.get('/glossary', {
      params: { projectId, ...params }
    });
  },

  /**
   * Search all glossary terms for the current user (no project filter)
   */
  async searchAllTerms(query, params = {}) {
    return api.get('/glossary/search', {
      params: { query, ...params }
    });
  },

  /**
   * Search glossary terms within a specific project
   */
  async searchTerms(projectId, query, params = {}) {
    return api.get('/glossary/search', {
      params: { projectId, query, ...params }
    });
  },

  /**
   * Get glossary term detail
   */
  async getTermDetail(termId) {
    return api.get(`/glossary/${termId}`);
  },

  /**
   * Create glossary term manually
   */
  async createTerm(termData) {
    return api.post('/glossary', termData);
  },

  /**
   * Update glossary term
   */
  async updateTerm(termId, termData) {
    return api.put(`/glossary/${termId}`, termData);
  },

  /**
   * Delete glossary term
   */
  async deleteTerm(termId) {
    return api.delete(`/glossary/${termId}`);
  },

  /**
   * Delete multiple glossary terms
   */
  async deleteTerms(termIds) {
    return api.delete('/glossary/batch', { data: termIds });
  },

  /**
   * Verify glossary term
   */
  async verifyTerm(termId) {
    return api.put(`/glossary/${termId}/verify`);
  },

  /**
   * Unverify glossary term
   */
  async unverifyTerm(termId) {
    return api.put(`/glossary/${termId}/unverify`);
  }
};
