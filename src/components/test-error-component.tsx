'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestErrorComponent() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('This is a test error for error boundary testing');
  }

  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-semibold mb-2">Test Error Component</h3>
      <p className="mb-4">This component can be used to test error boundaries.</p>
      <Button onClick={() => setShouldThrow(true)} variant="destructive">
        Throw Test Error
      </Button>
    </div>
  );
}
