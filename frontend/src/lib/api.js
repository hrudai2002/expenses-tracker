const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

async function request(path, options = {}) {
  const { token, method = 'GET', body, headers = {} } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(payload.message || 'Something went wrong.', response.status);
  }

  return payload;
}

const authApi = {
  signup(payload) {
    return request('/api/auth/signup', {
      method: 'POST',
      body: payload
    });
  },
  login(payload) {
    return request('/api/auth/login', {
      method: 'POST',
      body: payload
    });
  },
  me(token) {
    return request('/api/auth/me', { token });
  },
  changePassword(token, payload) {
    return request('/api/auth/change-password', {
      token,
      method: 'POST',
      body: payload
    });
  }
};

const categoryApi = {
  list(token) {
    return request('/api/categories', { token });
  },
  create(token, payload) {
    return request('/api/categories', {
      token,
      method: 'POST',
      body: payload
    });
  }
};

const transactionApi = {
  list(token, params) {
    const searchParams = new URLSearchParams();

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return request(`/api/transactions${queryString ? `?${queryString}` : ''}`, { token });
  },
  create(token, payload) {
    return request('/api/transactions', {
      token,
      method: 'POST',
      body: payload
    });
  },
  delete(token, transactionId) {
    return request(`/api/transactions/${transactionId}`, {
      token,
      method: 'DELETE'
    });
  },
  update(token, transactionId, payload) {
    return request(`/api/transactions/${transactionId}`, {
      token,
      method: 'PUT',
      body: payload
    });
  }
};

const budgetApi = {
  list(token, params) {
    const searchParams = new URLSearchParams();

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });

    return request(`/api/budgets?${searchParams.toString()}`, { token });
  },
  create(token, payload) {
    return request('/api/budgets', {
      token,
      method: 'POST',
      body: payload
    });
  },
  update(token, budgetId, payload) {
    return request(`/api/budgets/${budgetId}`, {
      token,
      method: 'PUT',
      body: payload
    });
  }
};

const dashboardApi = {
  get(token, params) {
    const searchParams = new URLSearchParams();

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });

    return request(`/api/dashboard?${searchParams.toString()}`, { token });
  }
};

export { ApiError, API_BASE_URL, authApi, budgetApi, categoryApi, dashboardApi, transactionApi };

