const API_URL = import.meta.env.VITE_API_URL || '/api';

export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  const baseUrl = API_URL.replace(/\/api\/?$/, '');
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    let url = `${API_URL}${endpoint}`;
    if (options.params && typeof options.params === 'object') {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value);
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('unauthorized'));
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};
