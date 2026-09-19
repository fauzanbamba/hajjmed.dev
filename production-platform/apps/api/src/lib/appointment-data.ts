import { prisma } from './prisma.js';
import { supabase } from './supabase.js';

function normalizeDateFields<T>(value: T): T {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((entry) => normalizeDateFields(entry)) as T;

  const next = { ...value } as Record<string, unknown>;
  const dateKeys = new Set(['startsAt', 'endsAt', 'createdAt', 'updatedAt']);

  for (const [key, entry] of Object.entries(next)) {
    if (dateKeys.has(key) && typeof entry === 'string') {
      next[key] = new Date(entry);
    } else if (typeof entry === 'object') {
      next[key] = normalizeDateFields(entry);
    }
  }

  return next as T;
}

export async function findAppointmentAvailability(input: {
  region: string;
  startsAtMin: Date;
  startsAtMax: Date;
  statuses: readonly string[];
}) {
  if (supabase) {
    const { data, error } = await supabase
      .from('Appointment')
      .select('startsAt,purpose,category')
      .eq('region', input.region)
      .gte('startsAt', input.startsAtMin.toISOString())
      .lt('startsAt', input.startsAtMax.toISOString())
      .in('status', input.statuses as string[]);

    if (!error && data) {
      return data.map((row) => normalizeDateFields(row));
    }
  }

  return prisma.appointment.findMany({
    where: {
      region: input.region,
      startsAt: { gte: input.startsAtMin, lt: input.startsAtMax },
      status: { in: input.statuses as any },
    },
    select: { startsAt: true, purpose: true, category: true },
  });
}

export async function findAppointmentByIdempotencyKey(idempotencyKey: string) {
  if (supabase) {
    const { data, error } = await supabase
      .from('Appointment')
      .select('*')
      .eq('idempotencyKey', idempotencyKey)
      .maybeSingle();

    if (!error && data) {
      return normalizeDateFields(data) as any;
    }
  }

  return prisma.appointment.findUnique({ where: { idempotencyKey } });
}

export async function createAppointmentRecord(input: {
  reference: string;
  pilgrimId: string;
  facilityId: string;
  purpose: string;
  category: string;
  region: string;
  startsAt: Date;
  endsAt: Date;
  idempotencyKey: string;
  bookedByUserId: string;
  screeningId?: string;
  clinicalDecision?: string;
  authorizedByUserId?: string;
}) {
  if (supabase) {
    const { data, error } = await supabase
      .from('Appointment')
      .insert({
        reference: input.reference,
        pilgrimId: input.pilgrimId,
        facilityId: input.facilityId,
        purpose: input.purpose,
        category: input.category,
        region: input.region,
        startsAt: input.startsAt.toISOString(),
        endsAt: input.endsAt.toISOString(),
        idempotencyKey: input.idempotencyKey,
        bookedByUserId: input.bookedByUserId,
        screeningId: input.screeningId ?? null,
        clinicalDecision: input.clinicalDecision ?? null,
        authorizedByUserId: input.authorizedByUserId ?? null,
      })
      .select('*')
      .single();

    if (!error && data) {
      return normalizeDateFields(data) as any;
    }
  }

  return prisma.appointment.create({
    data: {
      reference: input.reference,
      pilgrimId: input.pilgrimId,
      facilityId: input.facilityId,
      purpose: input.purpose as any,
      category: input.category as any,
      region: input.region,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      idempotencyKey: input.idempotencyKey,
      bookedByUserId: input.bookedByUserId,
      screeningId: input.screeningId,
      clinicalDecision: input.clinicalDecision,
      authorizedByUserId: input.authorizedByUserId,
    },
  });
}

export async function updateAppointmentRecord(
  id: string,
  data: { facilityId?: string; startsAt?: Date; endsAt?: Date; status?: string }
) {
  if (supabase) {
    const payload: Record<string, unknown> = {};
    if (data.facilityId) payload.facilityId = data.facilityId;
    if (data.startsAt) payload.startsAt = data.startsAt.toISOString();
    if (data.endsAt) payload.endsAt = data.endsAt.toISOString();
    if (data.status) payload.status = data.status;

    const { data: row, error } = await supabase
      .from('Appointment')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (!error && row) {
      return normalizeDateFields(row) as any;
    }
  }

  return prisma.appointment.update({
    where: { id },
    data: {
      facilityId: data.facilityId,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      status: data.status as any,
    },
  });
}
