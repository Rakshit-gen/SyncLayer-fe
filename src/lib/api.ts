// API client for backend communication

import {
  UserResponse,
  TeamsResponse,
  TeamWithMembersResponse,
  TeamMemberResponse,
  BoardsResponse,
  BoardFullResponse,
  BoardResponse,
  ColumnResponse,
  TaskResponse,
  ActivitiesResponse,
  NotificationsResponse,
  NotificationResponse,
  ApiError,
} from '@/types/api';
import {
  CreateUserRequest,
  CreateTeamRequest,
  CreateBoardRequest,
  CreateColumnRequest,
  CreateTaskRequest,
  MoveTaskRequest,
  AddTeamMemberRequest,
  TeamRole,
} from '@/types';

// Helper to get the correct API URL based on environment
function getApiUrl(): string {
  // Server-side (Node.js/Docker): use API_URL (Docker service name)
  // Client-side (browser): use NEXT_PUBLIC_API_URL (host machine)
  if (typeof window === 'undefined') {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      // Ensure http:// for localhost, not https://
      return apiUrl.replace(/^https:\/\/localhost/, 'http://localhost');
    }
    return 'http://localhost:8080';
  }
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    // Ensure http:// for localhost, not https://
    return apiUrl.replace(/^https:\/\/localhost/, 'http://localhost');
  }
  
  // Default: use http:// for localhost
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080';
    }
  }
  
  return 'http://localhost:8080';
}

class ApiClient {
  private getBaseUrl(): string {
    return `${getApiUrl()}/api/v1`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    userId?: string
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (userId) {
      (headers as Record<string, string>)['X-User-ID'] = userId;
    }

    const response = await fetch(`${this.getBaseUrl()}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: { code: 'UNKNOWN', message: 'An unknown error occurred' },
      }));
      throw new Error(error.error.message);
    }

    // Handle 204 No Content (for DELETE operations)
    if (response.status === 204) {
      return {} as T;
    }

    // Handle empty response body
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If no JSON content type, return empty object
      return {} as T;
    }

    // Parse JSON response
    const text = await response.text();
    if (!text || text.trim() === '') {
      return {} as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError, 'Response:', text);
      throw new Error('Invalid JSON response from server');
    }
  }

  // User endpoints
  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserById(id: string): Promise<UserResponse> {
    return this.request(`/users/${id}`);
  }

  async getUserByEmail(email: string): Promise<UserResponse> {
    return this.request(`/users/email/${encodeURIComponent(email)}`);
  }

  async updateUser(
    id: string,
    data: Partial<{ name: string; avatar_url: string }>
  ): Promise<UserResponse> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Team endpoints
  async createTeam(data: CreateTeamRequest): Promise<TeamWithMembersResponse> {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTeamById(id: string): Promise<TeamWithMembersResponse> {
    return this.request(`/teams/${id}`);
  }

  async getUserTeams(userId: string): Promise<TeamsResponse> {
    return this.request(`/users/${userId}/teams`);
  }

  async updateTeam(
    id: string,
    data: Partial<{ name: string; description: string }>
  ): Promise<TeamWithMembersResponse> {
    return this.request(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeam(id: string): Promise<void> {
    return this.request(`/teams/${id}`, { method: 'DELETE' });
  }

  async addTeamMember(
    teamId: string,
    data: AddTeamMemberRequest
  ): Promise<TeamMemberResponse> {
    return this.request(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeamMemberRole(
    teamId: string,
    userId: string,
    role: TeamRole
  ): Promise<TeamMemberResponse> {
    return this.request(`/teams/${teamId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    return this.request(`/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // Board endpoints
  async createBoard(data: CreateBoardRequest): Promise<BoardFullResponse> {
    return this.request('/boards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBoardById(id: string): Promise<BoardFullResponse> {
    return this.request(`/boards/${id}`);
  }

  async getTeamBoards(teamId: string): Promise<BoardsResponse> {
    return this.request(`/teams/${teamId}/boards`);
  }

  async updateBoard(
    id: string,
    data: Partial<{ name: string; description: string }>,
    userId: string
  ): Promise<BoardResponse> {
    return this.request(
      `/boards/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      userId
    );
  }

  async deleteBoard(id: string): Promise<void> {
    return this.request(`/boards/${id}`, { method: 'DELETE' });
  }

  // Column endpoints
  async createColumn(
    data: CreateColumnRequest,
    userId: string
  ): Promise<ColumnResponse> {
    return this.request(
      '/columns',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      userId
    );
  }

  async updateColumn(
    id: string,
    data: Partial<{ name: string; color: string }>,
    userId: string
  ): Promise<ColumnResponse> {
    return this.request(
      `/columns/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      userId
    );
  }

  async moveColumn(
    id: string,
    position: number,
    userId: string
  ): Promise<ColumnResponse> {
    return this.request(
      `/columns/${id}/position`,
      {
        method: 'PUT',
        body: JSON.stringify({ position }),
      },
      userId
    );
  }

  async deleteColumn(id: string, userId: string): Promise<void> {
    return this.request(`/columns/${id}`, { method: 'DELETE' }, userId);
  }

  // Task endpoints
  async createTask(data: CreateTaskRequest): Promise<TaskResponse> {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTaskById(id: string): Promise<TaskResponse> {
    return this.request(`/tasks/${id}`);
  }

  async updateTask(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      priority: string;
      due_date: string;
      assigned_to: string;
    }>,
    userId: string
  ): Promise<TaskResponse> {
    return this.request(
      `/tasks/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      userId
    );
  }

  async moveTask(
    id: string,
    data: MoveTaskRequest,
    userId: string
  ): Promise<TaskResponse> {
    return this.request(
      `/tasks/${id}/move`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      userId
    );
  }

  async deleteTask(id: string, userId: string): Promise<void> {
    return this.request(`/tasks/${id}`, { method: 'DELETE' }, userId);
  }

  async getTaskActivity(id: string): Promise<ActivitiesResponse> {
    return this.request(`/tasks/${id}/activity`);
  }

  // Notification endpoints
  async getUserNotifications(
    userId: string,
    unreadOnly = false
  ): Promise<NotificationsResponse> {
    const query = unreadOnly ? '?unread=true' : '';
    return this.request(`/users/${userId}/notifications${query}`);
  }

  async markNotificationAsRead(id: string): Promise<NotificationResponse> {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    return this.request(`/users/${userId}/notifications/read-all`, {
      method: 'PUT',
    });
  }
}

export const api = new ApiClient();
export default api;
