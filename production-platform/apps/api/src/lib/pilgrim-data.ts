import { db } from './db.js';
import { supabase } from './supabase.js';

export async function createPilgrimWithUser(input: {
  email: string | null;
  phone: string;
  passwordHash: string;
  organizationId?: string;
  passport: string;
  surname: string;
  givenNames: string;
  dateOfBirth: Date;
  sex: 'Female' | 'Male' | 'Other';
  nationality: string;
  residenceRegion: string;
  homeRegion: string;
  photoObjectKey?: string;
}) {
  if (supabase) {
    const { data: userData, error: userError } = await supabase
      .from('User')
      .insert({
        email: input.email?.toLowerCase() ?? null,
        phoneNormalized: input.phone,
        passwordHash: input.passwordHash,
        role: 'PILGRIM',
        status: 'ACTIVE',
        displayName: `${input.givenNames} ${input.surname}`,
        organizationId: input.organizationId ?? null,
      })
      .select('*')
      .single();

    if (!userError && userData) {
      const { data: pilgrimData, error: pilgrimError } = await supabase
        .from('Pilgrim')
        .insert({
          userId: userData.id,
          passportNumberNormalized: input.passport,
          surname: input.surname,
          givenNames: input.givenNames,
          dateOfBirth: input.dateOfBirth.toISOString(),
          sex: input.sex,
          nationality: input.nationality,
          region: input.residenceRegion,
          homeRegion: input.homeRegion,
          organizationId: input.organizationId ?? null,
          photoObjectKey: input.photoObjectKey ?? null,
        })
        .select('*')
        .single();

      if (!pilgrimError && pilgrimData) {
        return { id: pilgrimData.id, passportNumberNormalized: pilgrimData.passportNumberNormalized };
      }
    }
  }

  const created = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email?.toLowerCase() ?? null,
        phoneNormalized: input.phone,
        passwordHash: input.passwordHash,
        role: 'PILGRIM',
        status: 'ACTIVE',
        displayName: `${input.givenNames} ${input.surname}`,
        organizationId: input.organizationId,
      },
    });

    return tx.pilgrim.create({
      data: {
        userId: user.id,
        passportNumberNormalized: input.passport,
        surname: input.surname,
        givenNames: input.givenNames,
        dateOfBirth: input.dateOfBirth,
        sex: input.sex,
        nationality: input.nationality,
        region: input.residenceRegion,
        homeRegion: input.homeRegion,
        organizationId: input.organizationId,
        photoObjectKey: input.photoObjectKey,
      },
    });
  });

  return { id: created.id, passportNumberNormalized: created.passportNumberNormalized };
}

export async function listPilgrimsForRole(input: { role: string; organizationId?: string | null }) {
  if (supabase) {
    let query = supabase.from('Pilgrim').select('id, passportNumberNormalized, surname, givenNames, dateOfBirth, sex, region, photoObjectKey');
    if (input.role === 'AGENT') {
      query = query.eq('organizationId', input.organizationId ?? 'NONE');
    }
    const { data, error } = await query.order('surname', { ascending: true }).limit(200);
    if (!error && data) {
      return data as any[];
    }
  }

  return db.pilgrim.findMany({
    where: input.role === 'AGENT' ? { organizationId: input.organizationId ?? 'NONE' } : {},
    select: {
      id: true,
      passportNumberNormalized: true,
      surname: true,
      givenNames: true,
      dateOfBirth: true,
      sex: true,
      region: true,
      photoObjectKey: true,
    },
    orderBy: { surname: 'asc' },
    take: 200,
  });
}

export async function getPilgrimDetail(id: string) {
  if (supabase) {
    const { data, error } = await supabase
      .from('Pilgrim')
      .select('*, allergies(*), medications(*), immunizations(*), screenings(*), encounters(*), appointments(*)')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      return data as any;
    }
  }

  return db.pilgrim.findUniqueOrThrow({
    where: { id },
    include: {
      allergies: true,
      medications: true,
      immunizations: true,
      screenings: { orderBy: { performedAt: 'desc' }, take: 1 },
      encounters: { orderBy: { startedAt: 'desc' }, take: 20 },
      appointments: true,
    },
  });
}

export async function getPilgrimQrData(id: string) {
  if (supabase) {
    const { data, error } = await supabase
      .from('Pilgrim')
      .select('id, givenNames, surname, passportNumberNormalized, photoObjectKey, allergies(*), medications(*), immunizations(*), screenings(*, pilgrimage:*)')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      return data as any;
    }
  }

  return db.pilgrim.findUniqueOrThrow({
    where: { id },
    include: {
      allergies: { select: { display: true, reaction: true, severity: true, status: true } },
      medications: { where: { status: 'ACTIVE' }, select: { display: true, dose: true, route: true, frequency: true } },
      immunizations: { select: { vaccineDisplay: true, administeredAt: true } },
      screenings: { orderBy: { performedAt: 'desc' }, take: 1, select: { id: true, outcome: true, authenticatedAt: true, administratorAuthenticatedAt: true } },
    },
  });
}
