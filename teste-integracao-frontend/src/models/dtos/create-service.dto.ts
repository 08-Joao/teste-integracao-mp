export interface CreateServiceDto {
  name: string;
  duration: number;
  price: number;
  minBookingTime: number;
  addressId: string;
}
