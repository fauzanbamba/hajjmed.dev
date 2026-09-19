import { prisma } from './prisma.js';
import { supabase } from './supabase.js';

export async function findUserForLogin(identifier: string) {
  if (supabase) {
    const normalized = identifier.toLowerCase();
    const phone = identifier.replace(/\D/g, '');
    const { data, error } = await supabase
      .from('User')
      .select('*, pilgrim(*)')
      .or(`email.eq.${normalized},professionalEmail.eq.${normalized},phoneNormalized.eq.${phone}`)
      .limit(1);

    if (!error && data && data[0]) {
      return data[0] as any;
    }
  }

  return prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier.toLowerCase() },
        { professionalEmail: identifier.toLowerCase() },
        { phoneNormalized: identifier.replace(/\D/g, '') },
      ],
    },
    include: { pilgrim: true },
  });
}

export async function findUserById(userId: string) {
  if (supabase) {
    const { data, error } = await supabase.from('User').select('*').eq('id', userId).maybeSingle();
    if (!error && data) return data as any;
  }

  return prisma.user.findUnique({ where: { id: userId } });
}

export async function findTrustedDevice(userId: string, tokenHash: string, userAgentHash: string) {
  if (supabase) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('TrustedDevice')
      .select('*')
      .eq('userId', userId)
      .eq('tokenHash', tokenHash)
      .eq('userAgentHash', userAgentHash)
      .is('revokedAt', null)
      .gt('expiresAt', now)
      .limit(1);

    if (!error && data && data[0]) return data[0] as any;
  }

  return prisma.trustedDevice.findFirst({
    where: {
      userId,
      tokenHash,
      userAgentHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
}

export async function updateTrustedDeviceLastUsed(trustedDeviceId: string) {
  if (supabase) {
    const { error } = await supabase
      .from('TrustedDevice')
      .update({ lastUsedAt: new Date().toISOString() })
      .eq('id', trustedDeviceId);

    if (!error) return;
  }

  await prisma.trustedDevice.update({
    where: { id: trustedDeviceId },
    data: { lastUsedAt: new Date() },
  });
}

export async function createOtpChallenge(input: {
  userId: string;
  channel: 'SMS' | 'EMAIL';
  destinationMasked: string;
  codeHash: string;
  expiresAt: Date;
}) {
  if (supabase) {
    const { data, error } = await supabase
      .from('OtpChallenge')
      .insert({
        userId: input.userId,
        channel: input.channel,
        destinationMasked: input.destinationMasked,
        codeHash: input.codeHash,
        expiresAt: input.expiresAt.toISOString(),
      })
      .select('*')
      .single();

    if (!error && data) return data as any;
  }

  return prisma.otpChallenge.create({
    data: {
      userId: input.userId,
      channel: input.channel,
      destinationMasked: input.destinationMasked,
      codeHash: input.codeHash,
      expiresAt: input.expiresAt,
    },
  });
}

export async function expirePreviousOtpChallenges(userId: string) {
  if (supabase) {
    const { error } = await supabase
      .from('OtpChallenge')
      .update({ consumedAt: new Date().toISOString() })
      .eq('userId', userId)
      .is('consumedAt', null);

    if (!error) return;
  }

  await prisma.otpChallenge.updateMany({
    where: { userId, consumedAt: null },
    data: { consumedAt: new Date() },
  });
}

export async function findChallengeForVerification(challengeId: string) {
  if (supabase) {
    const { data, error } = await supabase
      .from('OtpChallenge')
      .select('*, user(*, pilgrim(*))')
      .eq('id', challengeId)
      .maybeSingle();

    if (!error && data) return data as any;
  }

  return prisma.otpChallenge.findUnique({
    where: { id: challengeId },
    include: { user: { include: { pilgrim: true } } },
  });
}

export async function incrementOtpAttempts(challengeId: string) {
  if (supabase) {
    const { data, error } = await supabase
      .from('OtpChallenge')
      .select('attempts')
      .eq('id', challengeId)
      .maybeSingle();

    if (!error && data) {
      const next = Number(data.attempts ?? 0) + 1;
      const { error: updateError } = await supabase
        .from('OtpChallenge')
        .update({ attempts: next })
        .eq('id', challengeId);

      if (!updateError) return;
    }
  }

  await prisma.otpChallenge.update({
    where: { id: challengeId },
    data: { attempts: { increment: 1 } },
  });
}

export async function markOtpChallengeConsumed(challengeId: string) {
  if (supabase) {
    const { error } = await supabase
      .from('OtpChallenge')
      .update({ consumedAt: new Date().toISOString() })
      .eq('id', challengeId);

    if (!error) return;
  }

  await prisma.otpChallenge.update({
    where: { id: challengeId },
    data: { consumedAt: new Date() },
  });
}

export async function createTrustedDeviceRecord(input: {
  userId: string;
  tokenHash: string;
  userAgentHash: string;
  expiresAt: Date;
}) {
  if (supabase) {
    const { error } = await supabase.from('TrustedDevice').insert({
      userId: input.userId,
      tokenHash: input.tokenHash,
      userAgentHash: input.userAgentHash,
      expiresAt: input.expiresAt.toISOString(),
    });

    if (!error) return;
  }

  await prisma.trustedDevice.create({
    data: {
      userId: input.userId,
      tokenHash: input.tokenHash,
      userAgentHash: input.userAgentHash,
      expiresAt: input.expiresAt,
    },
  });
}

export async function findSessionByRefreshToken(refreshTokenHash: string) {
  if (supabase) {
    const { data, error } = await supabase
      .from('Session')
      .select('*, user(*, pilgrim(*))')
      .eq('refreshTokenHash', refreshTokenHash)
      .is('revokedAt', null)
      .gt('expiresAt', new Date().toISOString())
      .limit(1);

    if (!error && data && data[0]) return data[0] as any;
  }

  return prisma.session.findFirst({
    where: {
      refreshTokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: { include: { pilgrim: true } } },
  });
}

export async function revokeSessionByRefreshToken(refreshTokenHash: string) {
  if (supabase) {
    const { error } = await supabase
      .from('Session')
      .update({ revokedAt: new Date().toISOString() })
      .eq('refreshTokenHash', refreshTokenHash)
      .is('revokedAt', null);

    if (!error) return;
  }

  await prisma.session.updateMany({
    where: {
      refreshTokenHash,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

export async function createSessionRecord(input: {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string | undefined;
}) {
  if (supabase) {
    const { data, error } = await supabase
      .from('Session')
      .insert({
        userId: input.userId,
        refreshTokenHash: input.refreshTokenHash,
        expiresAt: input.expiresAt.toISOString(),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent ?? null,
      })
      .select('*')
      .single();

    if (!error && data) return data as any;
  }

  return prisma.session.create({
    data: {
      userId: input.userId,
      refreshTokenHash: input.refreshTokenHash,
      expiresAt: input.expiresAt,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}
