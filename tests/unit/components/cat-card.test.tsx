import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CatCard from '@/components/cat-card';

// Mock next/image since it doesn't work well with Jest
jest.mock('next/image', () => {
  return ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => (
    <img src={src} alt={alt} width={width} height={height} />
 );
});

describe('CatCard', () => {
  const mockCat = {
    id: 1,
    name: 'Fluffy',
    breed: 'Persian',
    age: 3,
    gender: 'Male' as const,
    description: 'A fluffy Persian cat who loves to play',
    image: 'https://example.com/cat.jpg',
    dataAiHint: 'Friendly and playful',
  };

  it('should render cat information correctly', () => {
    render(<CatCard cat={mockCat} />);

    // Check that cat name is rendered
    expect(screen.getByText('Fluffy')).toBeInTheDocument();

    // Check that breed is rendered
    expect(screen.getByText('Persian')).toBeInTheDocument();

    // Check that age is rendered
    expect(screen.getByText('3 years old')).toBeInTheDocument();

    // Check that gender is rendered
    expect(screen.getByText('Male')).toBeInTheDocument();

    // Check that description is rendered
    expect(screen.getByText('A fluffy Persian cat who loves to play')).toBeInTheDocument();

    // Check that image is rendered with correct src and alt
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/cat.jpg');
    expect(image).toHaveAttribute('alt', 'Fluffy');
  });

  it('should render adopt button', () => {
    render(<CatCard cat={mockCat} />);

    const adoptButton = screen.getByRole('button', { name: /adopt/i });
    expect(adoptButton).toBeInTheDocument();
  });

  it('should handle missing image gracefully', () => {
    const catWithoutImage = { ...mockCat, image: '' };
    render(<CatCard cat={catWithoutImage} />);

    // Should still render the cat information even without image
    expect(screen.getByText('Fluffy')).toBeInTheDocument();
    expect(screen.getByText('Persian')).toBeInTheDocument();
 });

  it('should handle long descriptions with truncation', () => {
    const catWithLongDescription = {
      ...mockCat,
      description: 'A very long description that should be truncated or handled appropriately in the UI',
    };
    render(<CatCard cat={catWithLongDescription} />);

    // The description should still be rendered
    expect(screen.getByText(catWithLongDescription.description)).toBeInTheDocument();
  });
});
