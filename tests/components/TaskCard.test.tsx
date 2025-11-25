import { render, screen } from '@testing-library/react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Task } from '@/types';

// Mock the dependencies
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}));

jest.mock('@/stores/useBoardStore', () => ({
  useBoardStore: () => ({
    removeTask: jest.fn(),
  }),
}));

jest.mock('@/lib/api', () => ({
  api: {
    deleteTask: jest.fn(),
  },
}));

const mockTask: Task = {
  id: '123',
  column_id: 'col-1',
  title: 'Test Task',
  description: 'Test description',
  position: 0,
  priority: 'medium',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={mockTask} userId="user-1" />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders task description', () => {
    render(<TaskCard task={mockTask} userId="user-1" />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders priority badge', () => {
    render(<TaskCard task={mockTask} userId="user-1" />);
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('renders with different priority', () => {
    const urgentTask = { ...mockTask, priority: 'urgent' as const };
    render(<TaskCard task={urgentTask} userId="user-1" />);
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('renders due date when present', () => {
    const taskWithDue = { ...mockTask, due_date: '2024-02-01T00:00:00Z' };
    render(<TaskCard task={taskWithDue} userId="user-1" />);
    expect(screen.getByText(/Feb/)).toBeInTheDocument();
  });
});
