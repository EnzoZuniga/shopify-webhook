// Types principaux du système de tickets

export interface OrderData {
  id: number;
  order_number: number;
  total_price: string;
  currency: string;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
  };
  line_items: LineItem[];
  billing_address: {
    first_name: string;
    last_name: string;
    address1: string;
    city: string;
    zip: string;
    country: string;
  };
  financial_status: string;
  created_at: string;
}

export interface LineItem {
  title: string;
  quantity: number;
  price: string;
}

export interface TicketData {
  id: string;
  orderId: number;
  orderNumber: number;
  ticketId: string;
  customerEmail: string;
  ticketTitle: string;
  quantity: number;
  price: string;
  currency: string;
  qrCodeData: string;
  status: 'pending' | 'validated' | 'used' | 'expired';
  createdAt: string;
  validatedAt?: string;
  usedAt?: string;
  validatedBy?: string;
}

export interface TicketValidation {
  id: string;
  ticketId: string;
  validatedBy: string;
  validatedAt: string;
  notes?: string;
}

export interface TicketStats {
  total: number;
  pending: number;
  validated: number;
  used: number;
  expired: number;
  totalValidations: number;
}

export interface TicketGenerationOptions {
  orderId: number;
  orderNumber: number;
  customerEmail: string;
  lineItems: LineItem[];
  currency: string;
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
