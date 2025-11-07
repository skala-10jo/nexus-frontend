import { defineStore } from 'pinia';
import { documentService } from '@/services/documentService';

export const useDocumentStore = defineStore('documents', {
  state: () => ({
    documents: [],
    currentDocument: null,
    uploadingFiles: [],
    pagination: {
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    },
    hasMore: false,
    loading: false,
    error: null,
  }),

  getters: {
    totalSize: (state) => {
      return state.documents.reduce((sum, doc) => sum + doc.fileSize, 0);
    },
    recentUploadDate: (state) => {
      if (state.documents.length === 0) return null;
      const sorted = [...state.documents].sort((a, b) =>
        new Date(b.uploadDate) - new Date(a.uploadDate)
      );
      return sorted[0]?.uploadDate;
    },
  },

  actions: {
    async uploadDocument(file, onProgress) {
      try {
        const response = await documentService.uploadDocument(file, onProgress);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    async fetchDocuments(filters = {}) {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: 0,
          size: this.pagination.size,
          ...filters,
        };

        const response = await documentService.getDocuments(params);
        const data = response.data.data;

        this.documents = data.content;
        this.pagination = {
          page: data.number,
          size: data.size,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
        };
        this.hasMore = data.number < data.totalPages - 1;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loadMore() {
      if (!this.hasMore || this.loading) return;

      this.loading = true;
      try {
        const params = {
          page: this.pagination.page + 1,
          size: this.pagination.size,
        };

        const response = await documentService.getDocuments(params);
        const data = response.data.data;

        this.documents.push(...data.content);
        this.pagination = {
          page: data.number,
          size: data.size,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
        };
        this.hasMore = data.number < data.totalPages - 1;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async getDocumentDetail(documentId) {
      try {
        const response = await documentService.getDocument(documentId);
        this.currentDocument = response.data.data;
        return this.currentDocument;
      } catch (error) {
        throw error;
      }
    },

    async downloadDocument(documentId, filename) {
      try {
        await documentService.downloadDocument(documentId, filename);
      } catch (error) {
        throw error;
      }
    },

    async deleteDocument(documentId) {
      try {
        await documentService.deleteDocument(documentId);
        this.documents = this.documents.filter(doc => doc.id !== documentId);
        this.pagination.totalElements--;
      } catch (error) {
        throw error;
      }
    },
  },
});
