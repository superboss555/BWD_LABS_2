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


export interface UserInfo {
  name: string;
  email: string;
}

export interface Participant {
  id: number;
  eventId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  User?: UserInfo;
}