/**
 * Unit tests for useApiCall hook
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useApiCall } from '@/hooks/useApiCall';

// Mock fetch
global.fetch = vi.fn();

describe('useApiCall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useApiCall());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful API call', async () => {
    const mockData = { message: 'Success', result: 42 };
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useApiCall());

    await act(async () => {
      await result.current.execute('/api/test');
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle API error', async () => {
    const errorMessage = 'Request failed';
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    const { result } = renderHook(() => useApiCall());

    await act(async () => {
      try {
        await result.current.execute('/api/test');
      } catch (err) {
        // Expected to throw
      }
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should set loading state during API call', async () => {
    (global.fetch as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ data: 'test' }),
      }), 100))
    );

    const { result } = renderHook(() => useApiCall());

    act(() => {
      result.current.execute('/api/test');
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle POST request with body', async () => {
    const requestBody = { name: 'test', value: 123 };
    const mockData = { success: true };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useApiCall());

    await act(async () => {
      await result.current.execute('/api/test', {
        method: 'POST',
        body: requestBody,
      });
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    expect(result.current.data).toEqual(mockData);
  });

  it('should reset state', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' }),
    });

    const { result } = renderHook(() => useApiCall());

    await act(async () => {
      await result.current.execute('/api/test');
    });

    expect(result.current.data).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
