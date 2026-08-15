export type SetupStepId = 'staff' | 'hours' | 'service' | 'done';

export interface SetupSnapshot {
  bookableStaff: number;
  services: number;
}

/** Incomplete shop = missing bookable barber or catalog service. */
export function needsShopSetup(snapshot: SetupSnapshot): boolean {
  return snapshot.bookableStaff < 1 || snapshot.services < 1;
}

/**
 * Ordered setup steps still required.
 * Hours are always confirmed once when any other step is pending
 * (so first-time shops set the day window before going live).
 */
export function buildSetupPlan(snapshot: SetupSnapshot): SetupStepId[] {
  if (!needsShopSetup(snapshot)) {
    return [];
  }
  const steps: SetupStepId[] = [];
  if (snapshot.bookableStaff < 1) {
    steps.push('staff');
  }
  steps.push('hours');
  if (snapshot.services < 1) {
    steps.push('service');
  }
  return steps;
}
