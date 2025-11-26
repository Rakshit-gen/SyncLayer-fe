// Types for the SyncLayer application

export type TeamRole = 'admin' | 'editor' | 'viewer';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamWithRole extends Team {
  role: TeamRole;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  user?: User;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

export interface Board {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ColumnWithTasks extends Column {
  tasks: Task[];
}

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description?: string;
  position: number;
  priority: TaskPriority;
  due_date?: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BoardFull extends Board {
  columns: ColumnWithTasks[];
}

export interface ActivityLog {
  id: string;
  task_id?: string;
  board_id?: string;
  user_id?: string;
  action: string;
  details?: Record<string, unknown>;
  created_at: string;
  user?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

// Request/Response types
export interface CreateUserRequest {
  email: string;
  name: string;
  avatar_url?: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  created_by: string;
}

export interface CreateBoardRequest {
  team_id: string;
  name: string;
  description?: string;
  created_by: string;
}

export interface CreateColumnRequest {
  board_id: string;
  name: string;
  position?: number;
  color?: string;
}

export interface CreateTaskRequest {
  column_id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
  assigned_to?: string;
  created_by: string;
}

export interface MoveTaskRequest {
  column_id: string;
  position: number;
}

export interface AddTeamMemberRequest {
  user_id: string;
  role: TeamRole;
}
