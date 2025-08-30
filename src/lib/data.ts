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
  name: string;
  email: string;
  avatar: string;
};

export type AdoptionRequest = {
  id: number;
  catName: string;
  requestDate: string;
  status: 'Bekliyor' | 'Onaylandı' | 'Reddedildi';
  applicant: {
    name: string;
    email: string;
    phone: string;
    address: string;
    reason: string;
  };
};

/**
 * Seed data removed. Arrays start empty; data is added exclusively via API routes.
 * This avoids hard-coded breeds/records and ensures dynamic filter population.
 */
export const cats: Cat[] = [];

export const adoptionRequests: AdoptionRequest[] = [];