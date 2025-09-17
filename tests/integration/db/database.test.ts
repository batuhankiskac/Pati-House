import { CatRepository, AdoptionRequestRepository, UserRepository } from '@/lib/db/repositories';
import db from '@/lib/db/connection';

// Mock the database connection
jest.mock('@/lib/db/connection', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
 },
}));

describe('Database Integration', () => {
  const mockCat = {
    id: 1,
    name: 'Fluffy',
    breed: 'Persian',
    age: 3,
    gender: 'Male',
    description: 'A fluffy Persian cat',
    image: 'https://example.com/cat.jpg',
    dataAiHint: 'Friendly and playful',
  };

  const mockRequest = {
    id: 1,
    catName: 'Fluffy',
    requestDate: '2023-01-01',
    status: 'Pending',
    applicant: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address: '123 Main St',
      reason: 'I love cats',
    },
  };

  const mockUser = {
    id: '1',
    username: 'johndoe',
    email: 'john.doe@example.com',
    password: 'hashed_password',
    name: 'John Doe',
    avatar: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CatRepository', () => {
    describe('getAll', () => {
      it('should retrieve all cats from the database', async () => {
        const mockResult = {
          rows: [mockCat],
          rowCount: 1,
        };

        (db.query as jest.Mock).mockResolvedValue(mockResult);

        const cats = await CatRepository.getAll();

        expect(cats).toEqual([mockCat]);
        expect(db.query).toHaveBeenCalledWith(
          'SELECT id, name, breed, age, gender, description, image, data_ai_hint as "dataAiHint" FROM cats ORDER BY id'
        );
      });

      it('should handle database errors', async () => {
        (db.query as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

        await expect(CatRepository.getAll()).rejects.toThrow('Failed to fetch cats');
      });
    });

    describe('getById', () => {
      it('should retrieve a cat by ID', async () => {
        const mockResult = {
          rows: [mockCat],
          rowCount: 1,
        };

        (db.query as jest.Mock).mockResolvedValue(mockResult);

        const cat = await CatRepository.getById(1);

        expect(cat).toEqual(mockCat);
        expect(db.query).toHaveBeenCalledWith(
          'SELECT id, name, breed, age, gender, description, image, data_ai_hint as "dataAiHint" FROM cats WHERE id = $1',
          [1]
        );
      });

      it('should return null for non-existent cat', async () => {
        const mockResult = {
          rows: [],
          rowCount: 0,
        };

        (db.query as jest.Mock).mockResolvedValue(mockResult);

        const cat = await CatRepository.getById(999);

        expect(cat).toBeNull();
      });
    });

    describe('create', () => {
      it('should create a new cat', async () => {
        const newCat = {
          name: 'Whiskers',
          breed: 'Siamese',
          age: 2,
          gender: 'Female' as const,
          description: 'A beautiful Siamese cat',
          image: 'https://example.com/whiskers.jpg',
          dataAiHint: 'Elegant and vocal',
        };

        const mockResult = {
          rows: [{ ...newCat, id: 2 }],
          rowCount: 1,
        };

        (db.query as jest.Mock).mockResolvedValue(mockResult);

        const createdCat = await CatRepository.create(newCat);

        expect(createdCat).toEqual({ ...newCat, id: 2 });
        expect(db.query).toHaveBeenCalledWith(
          `INSERT INTO cats (name, breed, age, gender, description, image, data_ai_hint)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, breed, age, gender, description, image, data_ai_hint as "dataAiHint"`,
          [
            newCat.name,
            newCat.breed,
            newCat.age,
            newCat.gender,
            newCat.description,
            newCat.image,
            newCat.dataAiHint || ''
          ]
        );
      });

      it('should handle database errors when creating', async () => {
        const newCat = {
          name: 'Whiskers',
          breed: 'Siamese',
          age: 2,
          gender: 'Female' as const,
          description: 'A beautiful Siamese cat',
          image: 'https://example.com/whiskers.jpg',
          dataAiHint: 'Elegant and vocal',
        };

        (db.query as jest.Mock).mockRejectedValue(new Error('Database error'));

        await expect(CatRepository.create(newCat)).rejects.toThrow('Failed to create cat');
      });
    });

    describe('update', () => {
      it('should update an existing cat', async () => {
        const updateData = {
          name: 'Fluffy Updated',
        };

        const mockResult = {
          rows: [{ ...mockCat, name: 'Fluffy Updated' }],
          rowCount: 1,
        };

        (db.query as jest.Mock).mockResolvedValue(mockResult);

        const updatedCat = await CatRepository.update(1, updateData);

        expect(updatedCat).toEqual({ ...mockCat, name: 'Fluffy Updated' });
        expect(db.query).toHaveBeenCalledWith(
          `UPDATE cats SET name = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, name, breed, age, gender, description, image, data_ai_hint as "dataAiHint"`,
          ['Fluffy Updated', 1]
        );
      });

      it('should return null when updating non-existent cat', async () => {
        const updateData = {
          name: 'Non-existent Cat',
        };

        const mockResult = {
          rows: [],
          rowCount: 0,
        };

        (db.query as jest.Mock).mockResolvedValue(mockResult);

        const updatedCat = await CatRepository.update(999, updateData);

        expect(updatedCat).toBeNull();
      });
    });

    describe('delete', () => {
      it('should delete a cat', async () => {
        const mockResult = {
          rowCount: 1,
        };

        (db.query as jest.Mock).mockResolvedValue(mockResult);

        const result = await CatRepository.delete(1);

        expect(result).toBe(true);
        expect(db.query).toHaveBeenCalledWith('DELETE FROM cats WHERE id = $1', [1]);
      });

      it('should return false when deleting non-existent cat', async () => {
        const mockResult = {
          rowCount: 0,
        };

        (db.query as jest.Mock).mockResolvedValue(mockResult);

        const result = await CatRepository.delete(999);

        expect(result).toBe(false);
      });
    });
  });

  describe('AdoptionRequestRepository', () => {
    describe('getAll', () => {
      it('should retrieve all adoption requests', async () => {
        const mockResult = {
          rows: [{
            id: 1,
            catName: 'Fluffy',
            requestDate: '2023-01-01',
            status: 'Pending',
            'applicant.name': 'John Doe',
            'applicant.email': 'john.doe@example.com',
            'applicant.phone': '1234567890',
            'applicant.address': '123 Main St',
            'applicant.reason': 'I love cats'
          }],
          rowCount: 1,
        };

        (db.query as jest.Mock).mockResolvedValue(mockResult);

        const requests = await AdoptionRequestRepository.getAll();

        expect(requests).toEqual([mockRequest]);
        expect(db.query).toHaveBeenCalledWith(
          `SELECT id, cat_name as "catName", request_date as "requestDate", status,
                applicant_name as "applicant.name", applicant_email as "applicant.email",
                applicant_phone as "applicant.phone", applicant_address as "applicant.address",
                applicant_reason as "applicant.reason"
         FROM adoption_requests ORDER BY id`
        );
      });
    });

    describe('getById', () => {
      it('should retrieve an adoption request by ID', async () => {
        const mockResult = {
          rows: [{
            id: 1,
            catName: 'Fluffy',
            requestDate: '2023-01-01',
            status: 'Pending',
            'applicant.name': 'John Doe',
            'applicant.email': 'john.doe@example.com',
            'applicant.phone': '1234567890',
            'applicant.address': '123 Main St',
            'applicant.reason': 'I love cats'
          }],
          rowCount: 1,
        };

        (db.query as jest.Mock).mockResolvedValue(mockResult);

        const request = await AdoptionRequestRepository.getById(1);

        expect(request).toEqual(mockRequest);
        expect(db.query).toHaveBeenCalledWith(
          `SELECT id, cat_name as "catName", request_date as "requestDate", status,
                applicant_name as "applicant.name", applicant_email as "applicant.email",
                applicant_phone as "applicant.phone", applicant_address as "applicant.address",
                applicant_reason as "applicant.reason"
         FROM adoption_requests WHERE id = $1`,
          [1]
        );
      });
    });
  });

  describe('UserRepository', () => {
    describe('getByUsername', () => {
      it('should retrieve a user by username', async () => {
        const mockResult = {
          rows: [mockUser],
          rowCount: 1,
        };

        (db.query as jest.Mock).mockResolvedValue(mockResult);

        const user = await UserRepository.getByUsername('johndoe');

        expect(user).toEqual(mockUser);
        expect(db.query).toHaveBeenCalledWith(
          'SELECT id, username, email, password, name, avatar FROM users WHERE username = $1',
          ['johndoe']
        );
      });
    });

    describe('getByEmail', () => {
      it('should retrieve a user by email', async () => {
        const mockResult = {
          rows: [mockUser],
          rowCount: 1,
        };

        (db.query as jest.Mock).mockResolvedValue(mockResult);

        const user = await UserRepository.getByEmail('john.doe@example.com');

        expect(user).toEqual(mockUser);
        expect(db.query).toHaveBeenCalledWith(
          'SELECT id, username, email, password, name, avatar FROM users WHERE email = $1',
          ['john.doe@example.com']
        );
      });
    });
  });
});
