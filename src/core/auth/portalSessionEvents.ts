type Listener = () => void;

const shopLoginListeners = new Set<Listener>();
const customerLoginListeners = new Set<Listener>();

/** Cross-portal session isolation without coupling React trees. */
export const portalSessionEvents = {
  onShopLogin(listener: Listener): () => void {
    shopLoginListeners.add(listener);
    return () => {
      shopLoginListeners.delete(listener);
    };
  },
  emitShopLogin(): void {
    shopLoginListeners.forEach((listener) => listener());
  },
  onCustomerLogin(listener: Listener): () => void {
    customerLoginListeners.add(listener);
    return () => {
      customerLoginListeners.delete(listener);
    };
  },
  emitCustomerLogin(): void {
    customerLoginListeners.forEach((listener) => listener());
  },
};
