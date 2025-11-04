import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('merges Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('handles conflicting classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    expect(cn('base-class', isActive && 'active-class')).toBe('base-class active-class');
  });

  it('handles falsy values', () => {
    expect(cn('base-class', null, undefined)).toBe('base-class');
  });

  it('handles array inputs', () => {
    expect(cn(['px-2', 'py-1'], 'px-4')).toBe('py-1 px-4');
  });

  it('handles object inputs', () => {
    expect(cn({ 'px-2': true, 'py-1': false }, 'px-4')).toBe('px-4');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });

  it('handles single class input', () => {
    expect(cn('single-class')).toBe('single-class');
  });
});