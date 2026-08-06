import { useState, useEffect, useCallback, useRef } from 'react';
import type { EngineResponse, EngineListResponse, LoadingState } from '@/kestovar/engine';

interface UseEngineResult<T> {
  data: T | null;
  state: LoadingState;
  error: string | null;
  refetch: () => void;
  meta: any | null;
}

export function useEngineQuery<T = any>(
  fetcher: () => Promise<any>,
  deps: unknown[] = []
): UseEngineResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [state, setState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any | null>(null);
  const isMounted = useRef(true);

  const fetch = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const response = await fetcher();
      if (isMounted.current) {
        setData(response.data);
        setMeta(response.meta);
        setState('success');
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setState('error');
      }
    }
  }, [fetcher]);

  useEffect(() => {
    fetch();
    return () => { isMounted.current = false; };
  }, deps);

  return { data, state, error, refetch: fetch, meta };
}

export function useEngineListQuery<T = any>(
  fetcher: () => Promise<any>,
  deps: unknown[] = []
): UseEngineResult<T[]> {
  const [data, setData] = useState<T[] | null>(null);
  const [state, setState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any | null>(null);
  const isMounted = useRef(true);

  const fetch = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const response = await fetcher();
      if (isMounted.current) {
        setData(response.items);
        setMeta(response.meta);
        setState('success');
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setState('error');
      }
    }
  }, [fetcher]);

  useEffect(() => {
    fetch();
    return () => { isMounted.current = false; };
  }, deps);

  return { data, state, error, refetch: fetch, meta };
}
