import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import argon2 from 'argon2';
import { prisma } from '../lib/prisma.js';
import { otpCode,otpHash,safeMask,sha256 } from '../lib/crypto.js';
import { audit } from '../lib/audit.js';
import { config } from '../config.js';
import { randomUUID } from 'node:crypto';
import {
  createOtpChallenge,
  createSessionRecord,
  createTrustedDeviceRecord,
  expirePreviousOtpChallenges,
  findChallengeForVerification,
  findSessionByRefreshToken,
  findTrustedDevice,
  findUserForLogin,
  incrementOtpAttempts,
  markOtpChallengeConsumed,
  revokeSessionByRefreshToken,
  updateTrustedDeviceLastUsed,
} from '../lib/auth-data.js';

const trustedDeviceRoles=['PILGRIM','AGENT'];
const trustedDeviceLifetimeMs=30*86400_000;

export async function authRoutes(app:FastifyInstance){
  app.post('/login',{config:{rateLimit:{max:8,timeWindow:'15 minutes'}}},async(req,reply)=>{
    const body=z.object({identifier:z.string().min(3),password:z.string().min(8),trustedDeviceToken:z.string().min(60).optional()}).parse(req.body);
    const user=await findUserForLogin(body.identifier);
    if(!user||user.status!=='ACTIVE'||!await argon2.verify(user.passwordHash,body.password)){await audit(req,{action:'LOGIN_FAILED',subjectType:'User',metadata:{identifierHash:sha256(body.identifier)}});return reply.code(401).send({error:{code:'INVALID_CREDENTIALS',message:'Invalid credentials',requestId:req.id}})}
    if(body.trustedDeviceToken&&trustedDeviceRoles.includes(user.role)){
      const tokenHash=sha256(body.trustedDeviceToken),userAgentHash=sha256(String(req.headers['user-agent']??''));
      const trusted=await findTrustedDevice(user.id,tokenHash,userAgentHash);
      if(trusted){await updateTrustedDeviceLastUsed(trusted.id);return createSession(app,req,reply,user,{trustedDeviceAccepted:true});}
    }
    const emailDestination=user.professionalEmail||user.email;const channels=[...(user.phoneNormalized?[{channel:'SMS' as const,masked:safeMask(user.phoneNormalized,'sms')}]:[]),...(emailDestination?[{channel:'EMAIL' as const,masked:safeMask(emailDestination,'email')}]:[])];
    return reply.send({requiresOtp:true,userId:user.id,channels});
  });
  app.post('/otp/request',{config:{rateLimit:{max:4,timeWindow:'10 minutes'}}},async(req,reply)=>{
    const body=z.object({userId:z.string().uuid(),channel:z.enum(['SMS','EMAIL'])}).parse(req.body);const user=await prisma.user.findUniqueOrThrow({where:{id:body.userId}});if(user.status!=='ACTIVE')return reply.code(401).send({error:{code:'ACCOUNT_UNAVAILABLE',message:'OTP cannot be issued for this account'}});
    const destination=body.channel==='SMS'?user.phoneNormalized:(user.professionalEmail||user.email);if(!destination)return reply.code(400).send({error:{code:'CHANNEL_UNAVAILABLE',message:'Delivery channel is not registered'}});
    const code=otpCode();await expirePreviousOtpChallenges(user.id);const challenge=await createOtpChallenge({userId:user.id,channel:body.channel,destinationMasked:safeMask(destination,body.channel==='SMS'?'sms':'email'),codeHash:otpHash(code),expiresAt:new Date(Date.now()+5*60_000)});
    await audit(req,{action:'OTP_SENT',subjectType:'OtpChallenge',subjectId:challenge.id,metadata:{channel:body.channel}});
    return reply.send({challengeId:challenge.id,destinationMasked:challenge.destinationMasked,expiresInSeconds:300,...(config.OTP_DEMO_MODE?{demoCode:code}:{})});
  });
  app.post('/otp/verify',{config:{rateLimit:{max:8,timeWindow:'10 minutes'}}},async(req,reply)=>{
    const body=z.object({challengeId:z.string().uuid(),code:z.string().regex(/^\d{6}$/),trustDevice:z.boolean().default(false)}).parse(req.body);const challenge=await findChallengeForVerification(body.challengeId);
    if(!challenge||challenge.consumedAt||new Date(challenge.expiresAt)<new Date()||challenge.attempts>=5)return reply.code(401).send({error:{code:'OTP_EXPIRED',message:'OTP is invalid or expired'}});
    if(challenge.codeHash!==otpHash(body.code)){await incrementOtpAttempts(challenge.id);return reply.code(401).send({error:{code:'OTP_INVALID',message:'OTP is invalid or expired'}})}
    await markOtpChallengeConsumed(challenge.id);await audit(req,{action:'OTP_VERIFIED',subjectType:'OtpChallenge',subjectId:challenge.id});
    if(body.trustDevice&&trustedDeviceRoles.includes(challenge.user.role)){
      const trustedDeviceToken=randomUUID()+randomUUID(),expiresAt=new Date(Date.now()+trustedDeviceLifetimeMs);
      await createTrustedDeviceRecord({userId:challenge.user.id,tokenHash:sha256(trustedDeviceToken),userAgentHash:sha256(String(req.headers['user-agent']??'')),expiresAt});
      return createSession(app,req,reply,challenge.user,{trustedDeviceToken,trustedDeviceExpiresAt:expiresAt});
    }
    return createSession(app,req,reply,challenge.user);
  });
  app.post('/refresh',{config:{rateLimit:{max:20,timeWindow:'15 minutes'}}},async(req,reply)=>{
    const {refreshToken}=z.object({refreshToken:z.string().min(60)}).parse(req.body),hash=sha256(refreshToken),session=await findSessionByRefreshToken(hash);if(!session||session.user.status!=='ACTIVE')return reply.code(401).send({error:{code:'INVALID_SESSION',message:'Session is invalid or expired'}});await prisma.session.update({where:{id:session.id},data:{revokedAt:new Date()}});return createSession(app,req,reply,session.user)
  });
  app.post('/logout',async(req,reply)=>{
    const {refreshToken}=z.object({refreshToken:z.string().min(60)}).parse(req.body);await revokeSessionByRefreshToken(sha256(refreshToken));return reply.code(204).send()
  });
}

async function createSession(app:FastifyInstance,req:any,reply:any,user:any,extra:Record<string,unknown>={}){
  const refreshPlain=randomUUID()+randomUUID();const session=await createSessionRecord({userId:user.id,refreshTokenHash:sha256(refreshPlain),expiresAt:new Date(Date.now()+30*86400_000),ipAddress:req.ip,userAgent:req.headers['user-agent']});
  const payload={sub:user.id,role:user.role,organizationId:user.organizationId??undefined,pilgrimId:user.pilgrim?.id,sessionId:session.id};
  const accessToken=app.jwt.sign(payload,{expiresIn:'15m'});await audit(req,{action:'LOGIN',subjectType:'Session',subjectId:session.id,metadata:{trustedDeviceAccepted:extra.trustedDeviceAccepted===true}});return reply.send({requiresOtp:false,accessToken,refreshToken:refreshPlain,user:{id:user.id,displayName:user.displayName,role:user.role},...extra});
}
