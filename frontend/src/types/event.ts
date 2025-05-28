export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  createdBy: number;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
 
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
 
}

export interface UpdateEventRequest {
  id: string;
  title?: string;
  description?: string;
  date?: string;
} 