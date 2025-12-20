import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
}); 