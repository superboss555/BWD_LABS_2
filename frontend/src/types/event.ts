export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  organizerId: string;
  organizerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
} 