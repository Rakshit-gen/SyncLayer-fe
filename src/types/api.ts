// API response types

import {
  User,
  Team,
  TeamWithMembers,
  TeamWithRole,
  TeamMember,
  Board,
  BoardFull,
  Column,
  Task,
  ActivityLog,
  Notification,
} from './index';

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface UserResponse {
  user: User;
}

export interface TeamsResponse {
  teams: TeamWithRole[];
}

export interface TeamResponse {
  team: Team;
}

export interface TeamWithMembersResponse {
  team: TeamWithMembers;
}

export interface TeamMemberResponse {
  member: TeamMember;
}

export interface BoardsResponse {
  boards: Board[];
}

export interface BoardResponse {
  board: Board;
}

export interface BoardFullResponse {
  board: BoardFull;
}

export interface ColumnResponse {
  column: Column;
}

export interface TaskResponse {
  task: Task;
}

export interface ActivitiesResponse {
  activities: ActivityLog[];
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

export interface NotificationResponse {
  notification: Notification;
}

export interface HealthResponse {
  status: string;
  services: Record<string, string>;
}
