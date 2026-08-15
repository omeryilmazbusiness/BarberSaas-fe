import React, { createContext, useContext, useMemo } from 'react';

interface CustomerShopContextValue {
  shopSlug: string;
}

const CustomerShopContext = createContext<CustomerShopContextValue | null>(
  null,
);

interface ProviderProps {
  shopSlug: string;
  children: React.ReactNode;
}

/** Shop identity for the customer portal — lives on the parent route only (clean URLs). */
export function CustomerShopProvider({ shopSlug, children }: ProviderProps) {
  const value = useMemo(() => ({ shopSlug }), [shopSlug]);
  return (
    <CustomerShopContext.Provider value={value}>
      {children}
    </CustomerShopContext.Provider>
  );
}

export function useCustomerShop(): CustomerShopContextValue {
  const ctx = useContext(CustomerShopContext);
  if (!ctx) {
    throw new Error('useCustomerShop must be used within CustomerShopProvider');
  }
  return ctx;
}
