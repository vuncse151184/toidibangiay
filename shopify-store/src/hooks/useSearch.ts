"use client";
import { useState, useEffect, useRef } from "react";

export interface SearchParams {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string;
  colors?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  products: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets?: {
    brands: { key: string; doc_count: number }[];
    sizes: { key: string; doc_count: number }[];
    colors: { key: string; doc_count: number }[];
    categories: { key: string; doc_count: number }[];
    priceStats: { min: number; max: number; avg: number };
  };
}

export function useSearch(initial: SearchParams = {}) {
  const [params, setParams] = useState<SearchParams>(initial);
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
      if (!entries.length) return;

      const qs = new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?${qs}`);
        if (!res.ok) throw new Error("Search failed");
        setData(await res.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [JSON.stringify(params)]);

  return { data, loading, error, params, setParams };
}

export function useSuggest(q: string): string[] {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.length < 2) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`);
        console.log("Suggest response:", res);
        setSuggestions(await res.json());
      } catch {
        setSuggestions([]);
      }
    }, 200);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  return suggestions;
}