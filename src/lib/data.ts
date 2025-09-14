import { CatRepository, AdoptionRequestRepository, UserRepository } from './db/repositories';

export type Cat = {
  id: number;
  name: string;
  breed: string;
  age: number; // in years
  gender: 'Male' | 'Female';
  description: string;
  image: string;
  dataAiHint: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  password: string; // hashed password
  name: string;
  avatar?: string;
};

export type AdoptionRequest = {
  id: number;
  catName: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  applicant: {
    name: string;
    email: string;
    phone: string;
    address: string;
    reason: string;
  };
};

// Export the database repositories instead of in-memory arrays
export const catRepository = CatRepository;
export const adoptionRequestRepository = AdoptionRequestRepository;
export const userRepository = UserRepository;
