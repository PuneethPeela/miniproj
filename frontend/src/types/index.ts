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
  prepTime: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  menuItemId: string;
  menuItem?: MenuItem;
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
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'CANCELLED';

export interface QueueStatus {
  currentToken: number;
  estimatedWait: number;
  activeOrders: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}
