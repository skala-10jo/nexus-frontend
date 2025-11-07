import api from './api';

export const documentService = {
  // 문서 업로드
  async uploadDocument(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress?.(progress);
      },
    });
  },

  // 문서 목록 조회
  async getDocuments(params = {}) {
    return api.get('/documents', { params });
  },

  // 문서 상세 조회
  async getDocument(documentId) {
    return api.get(`/documents/${documentId}`);
  },

  // 문서 다운로드
  async downloadDocument(documentId, filename) {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });

    // 브라우저 다운로드 트리거
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // 문서 삭제
  async deleteDocument(documentId) {
    return api.delete(`/documents/${documentId}`);
  },

  // 문서 검색
  async searchDocuments(query, params = {}) {
    return api.get('/documents/search', {
      params: { query, ...params },
    });
  },
};
