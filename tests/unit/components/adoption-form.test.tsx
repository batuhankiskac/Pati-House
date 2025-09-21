import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdoptionForm from '@/components/adoption-form';

const createRequestMock = jest.fn();

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the useRequests hook
jest.mock('@/hooks/use-requests', () => ({
  useRequests: () => ({
    createRequest: createRequestMock,
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
    createRequestMock.mockResolvedValue({ success: true });
  });

  it('should render the form with correct fields', () => {
    render(<AdoptionForm catName={catName} />);

    // Check that the form title is rendered (it's actually in the reason field label)
    expect(screen.getByText(`${catName}'i neden sahiplenmek istiyorsunuz?`)).toBeInTheDocument();

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
      expect(screen.getByText(/Full name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Phone number must be at least 10 digits/i)).toBeInTheDocument();
      expect(screen.getByText(/Address must be at least 10 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Please provide more information \(at least 20 characters\)/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  }, 3000);

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
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  }, 3000);

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
      expect(screen.getByText(/Phone number must be at least 10 digits/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  }, 3000);

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
      expect(screen.getByText(/Please provide more information \(at least 20 characters\)/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  }, 3000);

  it('submits with the cat name populated from props', async () => {
    render(<AdoptionForm catName={catName} />);

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
      target: { value: 'I love cats and want to provide a loving home for Fluffy.' },
    });

    const submitButton = screen.getByRole('button', { name: /başvuruyu gönder/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createRequestMock).toHaveBeenCalledWith(
        expect.objectContaining({
          catName,
        })
      );
    });
  });
});
