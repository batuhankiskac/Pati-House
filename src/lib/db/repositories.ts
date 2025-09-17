import db from './connection';
import { Cat, AdoptionRequest, User } from '../data';

// Cat repository
export class CatRepository {
  static async getAll(): Promise<Cat[]> {
    try {
      const result = await db.query(
        'SELECT id, name, breed, age, gender, description, image, data_ai_hint as "dataAiHint" FROM cats ORDER BY id'
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching cats:', error);
      throw new Error('Failed to fetch cats');
    }
  }

  static async getById(id: number): Promise<Cat | null> {
    try {
      const result = await db.query(
        'SELECT id, name, breed, age, gender, description, image, data_ai_hint as "dataAiHint" FROM cats WHERE id = $1',
        [id]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error fetching cat with id ${id}:`, error);
      throw new Error('Failed to fetch cat');
    }
  }

  static async create(cat: Omit<Cat, 'id'>): Promise<Cat> {
    try {
      const result = await db.query(
        `INSERT INTO cats (name, breed, age, gender, description, image, data_ai_hint)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, breed, age, gender, description, image, data_ai_hint as "dataAiHint"`,
        [
          cat.name,
          cat.breed,
          cat.age,
          cat.gender,
          cat.description,
          cat.image,
          cat.dataAiHint || ''
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating cat:', error);
      throw new Error('Failed to create cat');
    }
  }

  static async update(id: number, updates: Partial<Cat>): Promise<Cat | null> {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      // Build dynamic update query
      if (updates.name !== undefined) {
        fields.push(`name = $${index++}`);
        values.push(updates.name);
      }
      if (updates.breed !== undefined) {
        fields.push(`breed = $${index++}`);
        values.push(updates.breed);
      }
      if (updates.age !== undefined) {
        fields.push(`age = $${index++}`);
        values.push(updates.age);
      }
      if (updates.gender !== undefined) {
        fields.push(`gender = $${index++}`);
        values.push(updates.gender);
      }
      if (updates.description !== undefined) {
        fields.push(`description = $${index++}`);
        values.push(updates.description);
      }
      if (updates.image !== undefined) {
        fields.push(`image = $${index++}`);
        values.push(updates.image);
      }
      if (updates.dataAiHint !== undefined) {
        fields.push(`data_ai_hint = $${index++}`);
        values.push(updates.dataAiHint);
      }

      if (fields.length === 0) {
        // No fields to update
        return await this.getById(id);
      }

      values.push(id); // Add id for WHERE clause

      const result = await db.query(
        `UPDATE cats SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${index}
         RETURNING id, name, breed, age, gender, description, image, data_ai_hint as "dataAiHint"`,
        values
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error updating cat with id ${id}:`, error);
      throw new Error('Failed to update cat');
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const result = await db.query('DELETE FROM cats WHERE id = $1', [id]);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error(`Error deleting cat with id ${id}:`, error);
      throw new Error('Failed to delete cat');
    }
  }
}

// Adoption request repository
export class AdoptionRequestRepository {
  static async getAll(): Promise<AdoptionRequest[]> {
    try {
      const result = await db.query(
        `SELECT id, cat_name as "catName", request_date as "requestDate", status,
                applicant_name as "applicant.name", applicant_email as "applicant.email",
                applicant_phone as "applicant.phone", applicant_address as "applicant.address",
                applicant_reason as "applicant.reason"
         FROM adoption_requests ORDER BY id`
      );

      // Transform the flat result into the nested structure
      return result.rows.map(row => ({
        id: row.id,
        catName: row.catName,
        requestDate: row.requestDate,
        status: row.status,
        applicant: {
          name: row['applicant.name'],
          email: row['applicant.email'],
          phone: row['applicant.phone'],
          address: row['applicant.address'],
          reason: row['applicant.reason']
        }
      }));
    } catch (error) {
      console.error('Error fetching adoption requests:', error);
      throw new Error('Failed to fetch adoption requests');
    }
  }

  static async getById(id: number): Promise<AdoptionRequest | null> {
    try {
      const result = await db.query(
        `SELECT id, cat_name as "catName", request_date as "requestDate", status,
                applicant_name as "applicant.name", applicant_email as "applicant.email",
                applicant_phone as "applicant.phone", applicant_address as "applicant.address",
                applicant_reason as "applicant.reason"
         FROM adoption_requests WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.id,
        catName: row.catName,
        requestDate: row.requestDate,
        status: row.status,
        applicant: {
          name: row['applicant.name'],
          email: row['applicant.email'],
          phone: row['applicant.phone'],
          address: row['applicant.address'],
          reason: row['applicant.reason']
        }
      };
    } catch (error) {
      console.error(`Error fetching adoption request with id ${id}:`, error);
      throw new Error('Failed to fetch adoption request');
    }
  }

  static async create(request: Omit<AdoptionRequest, 'id'>): Promise<AdoptionRequest> {
    try {
      const result = await db.query(
        `INSERT INTO adoption_requests (cat_name, request_date, status, applicant_name, applicant_email,
                                      applicant_phone, applicant_address, applicant_reason)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, cat_name as "catName", request_date as "requestDate", status`,
        [
          request.catName,
          request.requestDate,
          request.status,
          request.applicant.name,
          request.applicant.email,
          request.applicant.phone,
          request.applicant.address,
          request.applicant.reason
        ]
      );

      const row = result.rows[0];
      return {
        id: row.id,
        catName: row.catName,
        requestDate: row.requestDate,
        status: row.status,
        applicant: request.applicant
      };
    } catch (error) {
      console.error('Error creating adoption request:', error);
      throw new Error('Failed to create adoption request');
    }
  }

  static async update(id: number, updates: Partial<AdoptionRequest>): Promise<AdoptionRequest | null> {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      // Build dynamic update query
      if (updates.status !== undefined) {
        fields.push(`status = $${index++}`);
        values.push(updates.status);
      }
      if (updates.applicant !== undefined) {
        if (updates.applicant.name !== undefined) {
          fields.push(`applicant_name = $${index++}`);
          values.push(updates.applicant.name);
        }
        if (updates.applicant.email !== undefined) {
          fields.push(`applicant_email = $${index++}`);
          values.push(updates.applicant.email);
        }
        if (updates.applicant.phone !== undefined) {
          fields.push(`applicant_phone = $${index++}`);
          values.push(updates.applicant.phone);
        }
        if (updates.applicant.address !== undefined) {
          fields.push(`applicant_address = $${index++}`);
          values.push(updates.applicant.address);
        }
        if (updates.applicant.reason !== undefined) {
          fields.push(`applicant_reason = $${index++}`);
          values.push(updates.applicant.reason);
        }
      }

      if (fields.length === 0) {
        // No fields to update
        return await this.getById(id);
      }

      values.push(id); // Add id for WHERE clause

      const result = await db.query(
        `UPDATE adoption_requests SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${index}
         RETURNING id, cat_name as "catName", request_date as "requestDate", status`,
        values
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      // Get the full applicant data
      const fullRequest = await this.getById(row.id);
      return fullRequest;
    } catch (error) {
      console.error(`Error updating adoption request with id ${id}:`, error);
      throw new Error('Failed to update adoption request');
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const result = await db.query('DELETE FROM adoption_requests WHERE id = $1', [id]);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error(`Error deleting adoption request with id ${id}:`, error);
      throw new Error('Failed to delete adoption request');
    }
  }
}

// User repository
export class UserRepository {
  static async getAll(): Promise<User[]> {
    try {
      const result = await db.query(
        'SELECT id, username, email, password, name, avatar FROM users ORDER BY id'
      );
      return result.rows.map(row => ({
        ...row,
        id: row.id.toString()
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  static async getById(id: string): Promise<User | null> {
    try {
      const result = await db.query(
        'SELECT id, username, email, password, name, avatar FROM users WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        ...row,
        id: row.id.toString()
      };
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw new Error('Failed to fetch user');
    }
  }

  static async getByUsername(username: string): Promise<User | null> {
    try {
      const result = await db.query(
        'SELECT id, username, email, password, name, avatar FROM users WHERE username = $1',
        [username]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        ...row,
        id: row.id.toString()
      };
    } catch (error) {
      console.error(`Error fetching user with username ${username}:`, error);
      throw new Error('Failed to fetch user');
    }
  }

  static async getByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.query(
        'SELECT id, username, email, password, name, avatar FROM users WHERE email = $1',
        [email]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        ...row,
        id: row.id.toString()
      };
    } catch (error) {
      console.error(`Error fetching user with email ${email}:`, error);
      throw new Error('Failed to fetch user');
    }
  }

  static async create(user: Omit<User, 'id'>): Promise<User> {
    try {
      const result = await db.query(
        `INSERT INTO users (username, email, password, name, avatar)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, username, email, password, name, avatar`,
        [
          user.username,
          user.email,
          user.password,
          user.name,
          user.avatar || null
        ]
      );
      const row = result.rows[0];
      return {
        ...row,
        id: row.id.toString()
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      // Build dynamic update query
      if (updates.username !== undefined) {
        fields.push(`username = $${index++}`);
        values.push(updates.username);
      }
      if (updates.email !== undefined) {
        fields.push(`email = $${index++}`);
        values.push(updates.email);
      }
      if (updates.password !== undefined) {
        fields.push(`password = $${index++}`);
        values.push(updates.password);
      }
      if (updates.name !== undefined) {
        fields.push(`name = $${index++}`);
        values.push(updates.name);
      }
      if (updates.avatar !== undefined) {
        fields.push(`avatar = $${index++}`);
        values.push(updates.avatar);
      }

      if (fields.length === 0) {
        // No fields to update
        return await this.getById(id);
      }

      values.push(id); // Add id for WHERE clause

      const result = await db.query(
        `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${index}
         RETURNING id, username, email, password, name, avatar`,
        values
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        ...row,
        id: row.id.toString()
      };
    } catch (error) {
      console.error(`Error updating user with id ${id}:`, error);
      throw new Error('Failed to update user');
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const result = await db.query('DELETE FROM users WHERE id = $1', [id]);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error(`Error deleting user with id ${id}:`, error);
      throw new Error('Failed to delete user');
    }
 }
}
