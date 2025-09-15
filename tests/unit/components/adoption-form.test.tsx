import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdoptionForm from '@/components/adoption-form';

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the useRequests hook
jest.mock('@/hooks/use-requests', () => ({
  useRequests: () => ({
    createRequest: jest.fn(),
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('AdoptionForm', () => {
  const catName = 'Fluffy';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the form with correct fields', () => {
    render(<AdoptionForm catName={catName} />);

    // Check that the form title is rendered
    expect(screen.getByText(`${catName} için Sahiplenme Başvurusu`)).toBeInTheDocument();

    // Check that all form fields are rendered
    expect(screen.getByLabelText(/tam adınız/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefon numarası/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tam adres/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/neden sahiplenmek istiyorsunuz/i)).toBeInTheDocument();

    // Check that the submit button is rendered
    expect(screen.getByRole('button', { name: /başvuruyu gönder/i })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<AdoptionForm catName={catName} />);

    // Submit the form without filling any fields
    const submitButton = screen.getByRole('button', { name: /başvuruyu gönder/i });
    fireEvent.click(submitButton);

    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText(/tam adınız gereklidir/i)).toBeInTheDocument();
      expect(screen.getByText(/e-posta gereklidir/i)).toBeInTheDocument();
      expect(screen.getByText(/telefon numarası gereklidir/i)).toBeInTheDocument();
      expect(screen.getByText(/tam adres gereklidir/i)).toBeInTheDocument();
      expect(screen.getByText(/neden sahiplenmek istiyorsunuz en az 20 karakter olmalıdır/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    render(<AdoptionForm catName={catName} />);

    // Fill in the form with invalid email
    fireEvent.input(screen.getByLabelText(/tam adınız/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.input(screen.getByLabelText(/e-posta/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.input(screen.getByLabelText(/telefon numarası/i), {
      target: { value: '1234567890' },
    });
    fireEvent.input(screen.getByLabelText(/tam adres/i), {
      target: { value: '123 Main St, City, Country' },
    });
    fireEvent.input(screen.getByLabelText(/neden sahiplenmek istiyorsunuz/i), {
      target: { value: 'I love cats and want to provide a loving home for Fluffy.' },
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /başvuruyu gönder/i });
    fireEvent.click(submitButton);

    // Wait for validation error to appear
    await waitFor(() => {
      expect(screen.getByText(/lütfen geçerli bir e-posta adresi girin/i)).toBeInTheDocument();
    });
  });

  it('should validate phone number length', async () => {
    render(<AdoptionForm catName={catName} />);

    // Fill in the form with short phone number
    fireEvent.input(screen.getByLabelText(/tam adınız/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.input(screen.getByLabelText(/e-posta/i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.input(screen.getByLabelText(/telefon numarası/i), {
      target: { value: '123' },
    });
    fireEvent.input(screen.getByLabelText(/tam adres/i), {
      target: { value: '123 Main St, City, Country' },
    });
    fireEvent.input(screen.getByLabelText(/neden sahiplenmek istiyorsunuz/i), {
      target: { value: 'I love cats and want to provide a loving home for Fluffy.' },
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /başvuruyu gönder/i });
    fireEvent.click(submitButton);

    // Wait for validation error to appear
    await waitFor(() => {
      expect(screen.getByText(/telefon numarası en az 10 hane olmalıdır/i)).toBeInTheDocument();
    });
  });

  it('should validate reason length', async () => {
    render(<AdoptionForm catName={catName} />);

    // Fill in the form with short reason
    fireEvent.input(screen.getByLabelText(/tam adınız/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.input(screen.getByLabelText(/e-posta/i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.input(screen.getByLabelText(/telefon numarası/i), {
      target: { value: '1234567890' },
    });
    fireEvent.input(screen.getByLabelText(/tam adres/i), {
      target: { value: '123 Main St, City, Country' },
    });
    fireEvent.input(screen.getByLabelText(/neden sahiplenmek istiyorsunuz/i), {
      target: { value: 'Too short' },
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /başvuruyu gönder/i });
    fireEvent.click(submitButton);

    // Wait for validation error to appear
    await waitFor(() => {
      expect(screen.getByText(/neden sahiplenmek istiyorsunuz en az 20 karakter olmalıdır/i)).toBeInTheDocument();
    });
  });
});
