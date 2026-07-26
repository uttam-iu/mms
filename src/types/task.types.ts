import { USER_TYPE } from "./user.types";

export interface AttachmentType {
  id: string;
  name: string;
  url: string;
  size?: string;
  type?: string;
  uploadedAt?: string;
}

export interface CommentType {
  id: string;
  text: string;
  user: USER_TYPE;
  createdAt: string;
}

export interface TaskType {
  taskId: number | string;
  taskTitle: string;
  taskDescription?: string;
  priorityType?: string;
  taskType?: string;
  taskStatus: string;
  columnId: number | string;
  createdAt: string;
  createdBy: USER_TYPE | null;
  updatedAt?: string;
  updatedBy?: USER_TYPE | null;
  assignee?: USER_TYPE[] | [];
  dueDate?: string;
  attachments?: AttachmentType[];
  comments?: CommentType[];
}

export interface ColumnType {
  id: number | string;
  title: string;
}
