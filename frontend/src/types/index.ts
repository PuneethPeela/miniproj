export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'KITCHEN_STAFF';
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
  quantityAvailable: number;
  avgPrepSeconds: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  menuItemId: string;
  menuItem?: MenuItem;
}

export interface QueueEntry {
  id: string;
  stage: QueueStage;
  positionInQueue: number;
  estimatedReadyAt?: string;
  enteredStageAt: string;
}

export interface Order {
  id: string;
  tokenNumber: number;
  status: OrderStatus;
  totalAmount: number;
  estimatedAt?: string;
  createdAt: string;
  userId: string;
  user?: User;
  items: OrderItem[];
  queueEntry?: QueueEntry;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'CANCELLED';

export type QueueStage = 'WAITING' | 'IN_KITCHEN' | 'READY_FOR_PICKUP';

export interface QueueStatus {
  currentToken: number;
  estimatedWait: number;
  activeOrders: number;
  entries?: {
    position: number;
    stage: QueueStage;
    tokenNumber: number;
    estimatedReadyAt?: string;
  }[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}
