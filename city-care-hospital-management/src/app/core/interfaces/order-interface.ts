export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PharmacyOrder {
  _id?: string;
  patientName: string;
  patientEmail: string;
  contact: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'cancelled' | 'out-for-delivery' | 'delivered';
  createdAt?: Date;
}
