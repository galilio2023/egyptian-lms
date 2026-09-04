"use client";

import { useState, useMemo } from "react";

export interface UseTableFilterOptions<T> {
  items: T[];
  searchFields?: (item: T) => (string | number | undefined | null)[];
  searchPredicate?: (item: T, searchTerm: string) => boolean;
  filterPredicates?: Record<string, (item: T, filterValue: string) => boolean>;
  initialFilters?: Record<string, string>;
}

export function useTableFilter<T>({
  items,
  searchFields,
  searchPredicate,
  filterPredicates,
  initialFilters = {},
}: UseTableFilterOptions<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters(initialFilters);
  };

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      // 1. Search term check
      if (normalizedSearch) {
        if (searchPredicate) {
          if (!searchPredicate(item, normalizedSearch)) {
            return false;
          }
        } else if (searchFields) {
          const fields = searchFields(item);
          const hasMatch = fields.some((field) => {
            if (field === null || field === undefined) return false;
            return String(field).toLowerCase().includes(normalizedSearch);
          });
          if (!hasMatch) return false;
        }
      }

      // 2. Filter predicates check
      if (filterPredicates) {
        for (const [key, predicate] of Object.entries(filterPredicates)) {
          const filterValue = filters[key];
          if (filterValue && filterValue !== "all") {
            if (!predicate(item, filterValue)) {
              return false;
            }
          }
        }
      }

      return true;
    });
  }, [items, searchTerm, filters, searchFields, searchPredicate, filterPredicates]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    resetFilters,
    filteredItems,
    totalCount: items.length,
    filteredCount: filteredItems.length,
  };
}
