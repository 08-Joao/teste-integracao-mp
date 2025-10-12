export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  minBookingTime: number;
  addressId: string;
  createdAt: Date;
  updatedAt: Date;
}
