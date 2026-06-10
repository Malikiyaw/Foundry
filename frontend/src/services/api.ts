// No backend server — this is a fully local app.
// API calls are no-ops that return empty data.
// If you run the backend separately, swap this file.

const localFallback = {
  get: async () => ({ data: {} }),
  post: async () => ({ data: {} }),
  put: async () => ({ data: {} }),
  patch: async () => ({ data: {} }),
  delete: async () => ({ data: {} }),
};

const api = localFallback;

export default api;
