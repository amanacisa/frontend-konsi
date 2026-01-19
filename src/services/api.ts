import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
     // Don't set Content-Type for FormData - let browser handle it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.error || 'Terjadi kesalahan';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  }
};

// Chat API
export const chatAPI = {
  createSession: async (level: string = 'beginner') => {
    const response = await api.post('/chat/session', { level });
    return response.data;
  },
  
  sendMessage: async (message: string, sessionId?: string, level?: string) => {
    const response = await api.post('/chat/message', { message, sessionId, level });
    return response.data;
  },
  
  getHistory: async (sessionId: string, limit: number = 20) => {
    const response = await api.get(`/chat/session/${sessionId}/history?limit=${limit}`);
    return response.data;
  },
  
  updateLevel: async (sessionId: string, level: string) => {
    const response = await api.put(`/chat/session/${sessionId}/level`, { level });
    return response.data;
  }
};

// News API
export const newsAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/news', { params });
    return response.data;
  },
  
  getBySlug: async (slug: string) => {
    const response = await api.get(`/news/${slug}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/news', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/news/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/news/${id}`);
    return response.data;
  },
  
  like: async (id: string) => {
    const response = await api.post(`/news/${id}/like`);
    return response.data;
  }
};

// Stats API
export const statsAPI = {
  // Get admin dashboard statistics
  getAdminStats: async () => {
    const response = await api.get('/stats/admin');
    return response.data;
  },
  
  // Get user statistics
  getUserStats: async () => {
    const response = await api.get('/stats/user');
    return response.data;
  },
  
  // Get system health status
  getSystemHealth: async () => {
    const response = await api.get('/stats/health');
    return response.data;
  }
};

// Reports API
export const reportsAPI = {
  create: async (data: FormData) => {
    const response = await api.post('/reports', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getAll: async (params?: any) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
  
  updateStatus: async (id: string, status: string, note?: string) => {
    const response = await api.put(`/reports/${id}/status`, { status, note });
    return response.data;
  },
  
  assign: async (id: string, assignedTo: string) => {
    const response = await api.put(`/reports/${id}/assign`, { assignedTo });
    return response.data;
  },
  
  addNote: async (id: string, note: string) => {
    const response = await api.post(`/reports/${id}/notes`, { note });
    return response.data;
  },
  
  checkStatus: async (reportId: string) => {
    const response = await api.get(`/reports/status/${reportId}`);
    return response.data;
  }
};

// Forum API
export const forumAPI = {
  getPosts: async (params?: any) => {
    const response = await api.get('/forum', { params });
    return response.data;
  },
  
  getPost: async (id: string) => {
    const response = await api.get(`/forum/${id}`);
    return response.data;
  },
  
  // Updated createPost to properly handle FormData
  createPost: async (postData: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    image?: File | null;
  }) => {
    const formData = new FormData();
    
    // Append text fields
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('category', postData.category);
    
    // Handle tags - send as JSON string
    if (postData.tags && postData.tags.length > 0) {
      formData.append('tags', JSON.stringify(postData.tags));
    }
    
    // Append image if present
    if (postData.image && postData.image instanceof File) {
      formData.append('image', postData.image);
    }
    
    // Debug: Log FormData contents
    console.log('FormData contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    const response = await api.post('/forum', formData);
    return response.data;
  },
  
  votePost: async (id: string, voteType: string) => {
    const response = await api.post(`/forum/${id}/vote`, { voteType });
    return response.data;
  },
  
  addReply: async (id: string, content: string) => {
    const response = await api.post(`/forum/${id}/replies`, { content });
    return response.data;
  },
  
  voteReply: async (postId: string, replyId: string, voteType: string) => {
    const response = await api.post(`/forum/${postId}/replies/${replyId}/vote`, { voteType });
    return response.data;
  }
};

// Friends API
export const friendsAPI = {
  getFriends: async () => {
    const response = await api.get('/friends/list');
    return response.data;
  },
  
  getFriendRequests: async () => {
    const response = await api.get('/friends/requests');
    return response.data;
  },
  
  sendFriendRequest: async (userId: string) => {
    const response = await api.post('/friends/request', { userId });
    return response.data;
  },
  
  respondToFriendRequest: async (friendshipId: string, action: string) => {
    const response = await api.post('/friends/respond', { friendshipId, action });
    return response.data;
  },
  
  removeFriend: async (friendshipId: string) => {
    const response = await api.delete(`/friends/${friendshipId}`);
    return response.data;
  },
  
  searchUsers: async (query: string) => {
    const response = await api.get('/friends/search', { params: { q: query } });
    return response.data;
  }
};

// Short Form API
export const shortFormAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/short-form', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/short-form/${id}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    description: string;
    video_url: string;
    category: string;
    tags: string[];
  }) => {
    const response = await api.post('/short-form', data);
    return response.data;
  },

  like: async (id: string) => {
    const response = await api.post(`/short-form/${id}/like`);
    return response.data;
  },

  incrementView: async (id: string) => {
    const response = await api.post(`/short-form/${id}/view`);
    return response.data;
  },

  moderate: async (id: string, status: string, rejection_reason?: string) => {
    const response = await api.put(`/short-form/${id}/moderate`, {
      status,
      rejection_reason
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/short-form/${id}`);
    return response.data;
  }
};

export default api;