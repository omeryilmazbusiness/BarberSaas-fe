/** After manager logout, RootNavigator resets to this shop’s login. */
let pendingShopSlug: string | null = null;

export function setPendingManagerLogin(shopSlug: string): void {
  pendingShopSlug = shopSlug.trim() || null;
}

export function consumePendingManagerLogin(): string | null {
  const slug = pendingShopSlug;
  pendingShopSlug = null;
  return slug;
}
