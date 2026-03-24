export interface CreateDonorRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  preferredLocationId: number;
}

export interface UpdateDonorRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}
