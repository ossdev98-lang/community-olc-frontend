import api from './api.js';

export const uploadService = {
  serve: (folder, filename) => `${api.defaults.baseURL.replace(/\/api$/, '')}/uploads/${folder}/${filename}`,
};
