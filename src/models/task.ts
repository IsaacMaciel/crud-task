interface Task {
  id: string;
  title: string;
  description?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export default Task
