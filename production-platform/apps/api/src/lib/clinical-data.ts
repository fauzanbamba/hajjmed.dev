import { prisma } from './prisma.js';
import { supabase } from './supabase.js';

function normalizeDateFields<T>(value: T): T {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((entry) => normalizeDateFields(entry)) as T;

  const next = { ...value } as Record<string, unknown>;
  const dateKeys = new Set([
    'startsAt',
    'endsAt',
    'createdAt',
    'updatedAt',
    'performedAt',
    'authenticatedAt',
    'administratorAuthenticatedAt',
    'reviewDate',
    'administeredAt',
    'expiryDate',
    'regulatoryLockedAt',
  ]);

  for (const [key, entry] of Object.entries(next)) {
    if (dateKeys.has(key) && typeof entry === 'string') {
      next[key] = new Date(entry);
    } else if (typeof entry === 'object') {
      next[key] = normalizeDateFields(entry);
    }
  }

  return next as T;
}

export async function findPilgrimForClinical(pilgrimId: string) {
  if (supabase) {
    const { data, error } = await supabase
      .from('Pilgrim')
      .select('*, user(*), organization(*, users(*))')
      .eq('id', pilgrimId)
      .maybeSingle();

    if (!error && data) {
      return normalizeDateFields(data) as any;
    }
  }

  return prisma.pilgrim.findUniqueOrThrow({
    where: { id: pilgrimId },
    include: {
      user: true,
      organization: { include: { users: { where: { role: 'AGENT', status: 'ACTIVE' }, take: 1 } } },
    },
  });
}

export async function findScreeningById(id: string) {
  if (supabase) {
    const { data, error } = await supabase
      .from('Screening')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      return normalizeDateFields(data) as any;
    }
  }

  return prisma.screening.findUniqueOrThrow({ where: { id } });
}

export async function findScreeningByPilgrim(pilgrimId: string) {
  if (supabase) {
    const { data, error } = await supabase
      .from('Screening')
      .select('*')
      .eq('pilgrimId', pilgrimId)
      .is('supersedesId', null)
      .order('performedAt', { ascending: false })
      .limit(1);

    if (!error && data && data[0]) {
      return normalizeDateFields(data[0]) as any;
    }
  }

  return prisma.screening.findFirst({
    where: { pilgrimId, supersedesId: null },
    select: { id: true, outcome: true, performedAt: true },
    orderBy: { performedAt: 'desc' },
  });
}

export async function createScreeningRecord(input: {
  pilgrimId: string;
  questionnaireVersion: string;
  outcome: string;
  positiveFindings: any;
  rationale: string;
  recommendations?: string | null;
  ruleSetVersion: string;
  regulatoryExclusionCodes?: any;
  regulatoryHardRed?: boolean;
  regulatorySourceVersion?: string | null;
  regulatoryLockedAt?: Date | null;
  performedByUserId: string;
  supersedesId?: string | null;
}) {
  if (supabase) {
    const { data, error } = await supabase
      .from('Screening')
      .insert({
        pilgrimId: input.pilgrimId,
        questionnaireVersion: input.questionnaireVersion,
        outcome: input.outcome,
        positiveFindings: input.positiveFindings,
        rationale: input.rationale,
        recommendations: input.recommendations ?? null,
        ruleSetVersion: input.ruleSetVersion,
        regulatoryExclusionCodes: input.regulatoryExclusionCodes ?? null,
        regulatoryHardRed: Boolean(input.regulatoryHardRed),
        regulatorySourceVersion: input.regulatorySourceVersion ?? null,
        regulatoryLockedAt: input.regulatoryLockedAt ? input.regulatoryLockedAt.toISOString() : null,
        performedByUserId: input.performedByUserId,
        supersedesId: input.supersedesId ?? null,
      })
      .select('*')
      .single();

    if (!error && data) {
      return normalizeDateFields(data) as any;
    }
  }

  return prisma.screening.create({
    data: {
      pilgrimId: input.pilgrimId,
      questionnaireVersion: input.questionnaireVersion,
      outcome: input.outcome as any,
      positiveFindings: input.positiveFindings,
      rationale: input.rationale,
      recommendations: input.recommendations,
      ruleSetVersion: input.ruleSetVersion,
      regulatoryExclusionCodes: input.regulatoryExclusionCodes as any,
      regulatoryHardRed: Boolean(input.regulatoryHardRed),
      regulatorySourceVersion: input.regulatorySourceVersion,
      regulatoryLockedAt: input.regulatoryLockedAt,
      performedByUserId: input.performedByUserId,
      supersedesId: input.supersedesId,
    },
  });
}

export async function createImmunizationRecord(input: {
  pilgrimId: string;
  facilityId: string;
  vaccineCode: string;
  vaccineDisplay: string;
  lotNumber: string;
  expiryDate: Date;
  administeredAt: Date;
  performerUserId: string;
}) {
  if (supabase) {
    const { data, error } = await supabase
      .from('Immunization')
      .insert({
        pilgrimId: input.pilgrimId,
        facilityId: input.facilityId,
        vaccineCode: input.vaccineCode,
        vaccineDisplay: input.vaccineDisplay,
        lotNumber: input.lotNumber,
        expiryDate: input.expiryDate.toISOString(),
        administeredAt: input.administeredAt.toISOString(),
        performerUserId: input.performerUserId,
      })
      .select('*')
      .single();

    if (!error && data) {
      return normalizeDateFields(data) as any;
    }
  }

  return prisma.immunization.create({
    data: {
      pilgrimId: input.pilgrimId,
      facilityId: input.facilityId,
      vaccineCode: input.vaccineCode,
      vaccineDisplay: input.vaccineDisplay,
      lotNumber: input.lotNumber,
      expiryDate: input.expiryDate,
      administeredAt: input.administeredAt,
      performerUserId: input.performerUserId,
    },
  });
}

export async function createEncounterRecord(input: {
  pilgrimId: string;
  facilityId: string;
  type: string;
  chiefComplaint?: string | null;
  diagnosisCodes: any;
  summary: string;
  interventions: any;
  disposition?: string | null;
  status?: string;
  clinicianUserId: string;
}) {
  if (supabase) {
    const { data, error } = await supabase
      .from('Encounter')
      .insert({
        pilgrimId: input.pilgrimId,
        facilityId: input.facilityId,
        type: input.type,
        chiefComplaint: input.chiefComplaint ?? null,
        diagnosisCodes: input.diagnosisCodes,
        summary: input.summary,
        interventions: input.interventions,
        disposition: input.disposition ?? null,
        status: input.status ?? 'FINISHED',
        clinicianUserId: input.clinicianUserId,
      })
      .select('*')
      .single();

    if (!error && data) {
      return normalizeDateFields(data) as any;
    }
  }

  return prisma.encounter.create({
    data: {
      pilgrimId: input.pilgrimId,
      facilityId: input.facilityId,
      type: input.type as any,
      chiefComplaint: input.chiefComplaint,
      diagnosisCodes: input.diagnosisCodes,
      summary: input.summary,
      interventions: input.interventions,
      disposition: input.disposition,
      status: (input.status ?? 'FINISHED') as any,
      clinicianUserId: input.clinicianUserId,
    },
  });
}

export async function findCarePlanByPilgrim(pilgrimId: string) {
  if (supabase) {
    const { data, error } = await supabase
      .from('CarePlan')
      .select('*')
      .eq('pilgrimId', pilgrimId)
      .maybeSingle();

    if (!error && data) {
      return normalizeDateFields(data) as any;
    }
  }

  return prisma.carePlan.findUnique({ where: { pilgrimId } });
}

export async function upsertCarePlanRecord(input: {
  pilgrimId: string;
  selections: any;
  responsibleTeam: string;
  reviewDate?: Date | null;
  clinicalRationale: string;
  sharedSummary: string;
  status: string;
  updatedByUserId: string;
  createdByUserId?: string;
}) {
  const existing = await findCarePlanByPilgrim(input.pilgrimId);

  if (supabase) {
    const payload = {
      pilgrimId: input.pilgrimId,
      selections: input.selections,
      responsibleTeam: input.responsibleTeam,
      reviewDate: input.reviewDate ? input.reviewDate.toISOString() : null,
      clinicalRationale: input.clinicalRationale,
      sharedSummary: input.sharedSummary,
      status: input.status,
      updatedByUserId: input.updatedByUserId,
      createdByUserId: input.createdByUserId ?? input.updatedByUserId,
    };

    if (existing) {
      const { data, error } = await supabase
        .from('CarePlan')
        .update(payload)
        .eq('pilgrimId', input.pilgrimId)
        .select('*')
        .single();

      if (!error && data) {
        return normalizeDateFields(data) as any;
      }
    } else {
      const { data, error } = await supabase
        .from('CarePlan')
        .insert(payload)
        .select('*')
        .single();

      if (!error && data) {
        return normalizeDateFields(data) as any;
      }
    }
  }

  return existing
    ? prisma.carePlan.update({
        where: { pilgrimId: input.pilgrimId },
        data: {
          selections: input.selections,
          responsibleTeam: input.responsibleTeam,
          reviewDate: input.reviewDate,
          clinicalRationale: input.clinicalRationale,
          sharedSummary: input.sharedSummary,
          status: input.status as any,
          updatedByUserId: input.updatedByUserId,
        },
      })
    : prisma.carePlan.create({
        data: {
          pilgrimId: input.pilgrimId,
          selections: input.selections,
          responsibleTeam: input.responsibleTeam,
          reviewDate: input.reviewDate,
          clinicalRationale: input.clinicalRationale,
          sharedSummary: input.sharedSummary,
          status: input.status as any,
          createdByUserId: input.createdByUserId ?? input.updatedByUserId,
          updatedByUserId: input.updatedByUserId,
        },
      });
}
