export interface Medicine {
  id: number;
  name: string;
  dosage: string;
  desc: string;
  price: number;
  image?: string;
  manufacturer: string;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}
