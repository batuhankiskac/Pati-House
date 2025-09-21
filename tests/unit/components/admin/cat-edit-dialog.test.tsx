import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CatEditDialog from '@/components/admin/cat-edit-dialog';
import type { Cat } from '@/lib/data';

const toastMock = jest.fn();

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

describe('CatEditDialog', () => {
  const onCreateCatMock = jest.fn();
  const onUpdateCatMock = jest.fn();
  const onOpenChangeMock = jest.fn();
  const onSuccessMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    onCreateCatMock.mockResolvedValue({ success: true });
    onUpdateCatMock.mockResolvedValue({ success: true });
    onSuccessMock.mockResolvedValue(undefined);
  });

  it('creates a new cat and closes the dialog on success', async () => {
    render(
      <CatEditDialog
        isOpen
        onOpenChange={onOpenChangeMock}
        cat={null}
        isEditing={false}
        onSuccess={onSuccessMock}
        onCreateCat={onCreateCatMock}
        onUpdateCat={onUpdateCatMock}
      />
    );

    fireEvent.change(screen.getByLabelText('İsim'), { target: { value: 'Misket' } });
    fireEvent.change(screen.getByLabelText('Cins'), { target: { value: 'Tekir' } });
    fireEvent.change(screen.getByLabelText('Açıklama'), {
      target: { value: 'Sevecen ve oyuncu bir kedi.' },
    });
    fireEvent.change(screen.getByLabelText('Görsel URL\'si'), {
      target: { value: 'https://example.com/cat.png' },
    });

    const submitButton = screen.getByRole('button', { name: 'Ekle' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onCreateCatMock).toHaveBeenCalledTimes(1);
    });

    expect(onCreateCatMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Misket',
        breed: 'Tekir',
        description: 'Sevecen ve oyuncu bir kedi.',
        image: 'https://example.com/cat.png',
      })
    );
    expect(onUpdateCatMock).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
      expect(onSuccessMock).toHaveBeenCalledTimes(1);
    });
  });

  it('updates an existing cat when editing', async () => {
    const existingCat: Cat = {
      id: 99,
      name: 'Pamuk',
      breed: 'British Shorthair',
      age: 4,
      gender: 'Female',
      description: 'Sakin ve uysal bir kedi.',
      image: 'https://example.com/pamuk.png',
      dataAiHint: 'pamuk-ai',
    };

    render(
      <CatEditDialog
        isOpen
        onOpenChange={onOpenChangeMock}
        cat={existingCat}
        isEditing
        onSuccess={onSuccessMock}
        onCreateCat={onCreateCatMock}
        onUpdateCat={onUpdateCatMock}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Güncelle' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onUpdateCatMock).toHaveBeenCalledTimes(1);
    });

    expect(onUpdateCatMock).toHaveBeenCalledWith(
      existingCat.id,
      expect.objectContaining({
        name: existingCat.name,
        breed: existingCat.breed,
      })
    );
    expect(onCreateCatMock).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
      expect(onSuccessMock).toHaveBeenCalledTimes(1);
    });
  });
});
