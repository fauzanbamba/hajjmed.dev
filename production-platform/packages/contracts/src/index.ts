export const roles = ['PILGRIM','AGENT','CLINICIAN','NURSE','ALLIED_HEALTH','ADMIN','MEDICAL_DIRECTOR'] as const;
export type Role = typeof roles[number];

export const roleRank: Record<Role, number> = {
  PILGRIM: 1, AGENT: 1, CLINICIAN: 2, NURSE: 2, ALLIED_HEALTH: 2, ADMIN: 3, MEDICAL_DIRECTOR: 4,
};

export const appointmentPurposes = ['SCREENING','VACCINATION','SCREENING_AND_VACCINATION','REVIEW'] as const;
export type AppointmentPurpose = typeof appointmentPurposes[number];
export const bookingCategories = ['SCHEDULED','WALK_IN','VIP'] as const;
export type BookingCategory = typeof bookingCategories[number];

export const screeningOutcomes = ['GREEN','AMBER','RED'] as const;
export type ScreeningOutcome = typeof screeningOutcomes[number];

export const ghanaRegions = [
  'Ahafo','Ashanti','Bono','Bono East','Central','Eastern','Greater Accra','North East',
  'Northern','Oti','Savannah','Upper East','Upper West','Volta','Western','Western North'
] as const;
export type GhanaRegion = typeof ghanaRegions[number];

export const regionalCapacity = (region: GhanaRegion) =>
  ['Greater Accra','Ashanti','Northern'].includes(region) ? 100 : 50;

export const appointmentSessionHours = [8,10,12,14] as const;
export const protectedDailyCapacity = 10;

export interface AuthPrincipal {
  userId: string;
  role: Role;
  organizationId?: string;
  pilgrimId?: string;
  sessionId: string;
}

export interface ApiErrorBody {
  error: { code: string; message: string; requestId?: string; details?: unknown };
}
