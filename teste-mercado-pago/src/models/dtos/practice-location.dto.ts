export interface CreatePracticeLocationDto {
  zipCode: string;
  street: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  coordinates: string;
  doctorProfileId: string;
}

export interface UpdatePracticeLocationDto {
  zipCode?: string;
  street?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: string;
}
