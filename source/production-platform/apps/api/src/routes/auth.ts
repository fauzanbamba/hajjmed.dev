import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import argon2 from 'argon2';
import { prisma } from '../lib/prisma.js';
import { otpCode,otpHash,safeMask,sha256 } from '../lib/crypto.js';
import { audit } from '../lib/audit.js';
import { config } from '../config.js';
import { randomUUID } from 'node:crypto';

export async function authRoutes(app:FastifyInstance){
  app.post('/login',{config:{rateLimit:{max:8,timeWindow:'15 minutes'}}},async(req,reply)=>{
    const body=z.object({identifier:z.string().min(3),password:z.string().min(8)}).parse(req.body);
    const user=await prisma.user.findFirst({where:{OR:[{email:body.identifier.toLowerCase()},{professionalEmail:body.identifier.toLowerCase()},{phoneNormalized:body.identifier.replace(/\D/g,'')}]},include:{pilgrim:true}});
    if(!user||user.status!=='ACTIVE'||!await argon2.verify(user.passwordHash,body.password)){await audit(req,{action:'LOGIN_FAILED',subjectType:'User',metadata:{identifierHash:sha256(body.identifier)}});return reply.code(401).send({error:{code:'INVALID_CREDENTIALS',message:'Invalid credentials',requestId:req.id}})}
    if(user.role==='AGENT')return createSession(app,req,reply,user);
    const emailDestination=user.professionalEmail||user.email;const channels=[...(user.phoneNormalized?[{channel:'SMS' as const,masked:safeMask(user.phoneNormalized,'sms')}]:[]),...(emailDestination?[{channel:'EMAIL' as const,masked:safeMask(emailDestination,'email')}]:[])];
    return reply.send({requiresOtp:true,userId:user.id,channels});
  });
  app.post('/otp/request',{config:{rateLimit:{max:4,timeWindow:'10 minutes'}}},async(req,reply)=>{
    const body=z.object({userId:z.string().uuid(),channel:z.enum(['SMS','EMAIL'])}).parse(req.body);const user=await prisma.user.findUniqueOrThrow({where:{id:body.userId}});if(user.status!=='ACTIVE')return reply.code(401).send({error:{code:'ACCOUNT_UNAVAILABLE',message:'OTP cannot be issued for this account'}});
    const destination=body.channel==='SMS'?user.phoneNormalized:(user.professionalEmail||user.email);if(!destination)return reply.code(400).send({error:{code:'CHANNEL_UNAVAILABLE',message:'Delivery channel is not registered'}});
    const code=otpCode();await prisma.otpChallenge.updateMany({where:{userId:user.id,consumedAt:null},data:{consumedAt:new Date()}});const challenge=await prisma.otpChallenge.create({data:{userId:user.id,channel:body.channel,destinationMasked:safeMask(destination,body.channel==='SMS'?'sms':'email'),codeHash:otpHash(code),expiresAt:new Date(Date.now()+5*60_000)}});
    await audit(req,{action:'OTP_SENT',subjectType:'OtpChallenge',subjectId:challenge.id,metadata:{channel:body.channel}});
    return reply.send({challengeId:challenge.id,destinationMasked:challenge.destinationMasked,expiresInSeconds:300,...(config.OTP_DEMO_MODE?{demoCode:code}:{})});
  });
  app.post('/otp/verify',{config:{rateLimit:{max:8,timeWindow:'10 minutes'}}},async(req,reply)=>{
    const body=z.object({challengeId:z.string().uuid(),code:z.string().regex(/^\d{6}$/)}).parse(req.body);const challenge=await prisma.otpChallenge.findUnique({where:{id:body.challengeId},include:{user:{include:{pilgrim:true}}}});
    if(!challenge||challenge.consumedAt||challenge.expiresAt<new Date()||challenge.attempts>=5)return reply.code(401).send({error:{code:'OTP_EXPIRED',message:'OTP is invalid or expired'}});
    if(challenge.codeHash!==otpHash(body.code)){await prisma.otpChallenge.update({where:{id:challenge.id},data:{attempts:{increment:1}}});return reply.code(401).send({error:{code:'OTP_INVALID',message:'OTP is invalid or expired'}})}
    await prisma.otpChallenge.update({where:{id:challenge.id},data:{consumedAt:new Date()}});await audit(req,{action:'OTP_VERIFIED',subjectType:'OtpChallenge',subjectId:challenge.id});return createSession(app,req,reply,challenge.user);
  });
  app.post('/refresh',{config:{rateLimit:{max:20,timeWindow:'15 minutes'}}},async(req,reply)=>{
    const {refreshToken}=z.object({refreshToken:z.string().min(60)}).parse(req.body),hash=sha256(refreshToken),session=await prisma.session.findFirst({where:{refreshTokenHash:hash,revokedAt:null,expiresAt:{gt:new Date()}},include:{user:{include:{pilgrim:true}}}});if(!session||session.user.status!=='ACTIVE')return reply.code(401).send({error:{code:'INVALID_SESSION',message:'Session is invalid or expired'}});await prisma.session.update({where:{id:session.id},data:{revokedAt:new Date()}});return createSession(app,req,reply,session.user)
  });
  app.post('/logout',async(req,reply)=>{
    const {refreshToken}=z.object({refreshToken:z.string().min(60)}).parse(req.body);await prisma.session.updateMany({where:{refreshTokenHash:sha256(refreshToken),revokedAt:null},data:{revokedAt:new Date()}});return reply.code(204).send()
  });
}

async function createSession(app:FastifyInstance,req:any,reply:any,user:any){
  const refreshPlain=randomUUID()+randomUUID();const session=await prisma.session.create({data:{userId:user.id,refreshTokenHash:sha256(refreshPlain),expiresAt:new Date(Date.now()+30*86400_000),ipAddress:req.ip,userAgent:req.headers['user-agent']}});
  const payload={sub:user.id,role:user.role,organizationId:user.organizationId??undefined,pilgrimId:user.pilgrim?.id,sessionId:session.id};
  const accessToken=app.jwt.sign(payload,{expiresIn:'15m'});await audit(req,{action:'LOGIN',subjectType:'Session',subjectId:session.id});return reply.send({requiresOtp:false,accessToken,refreshToken:refreshPlain,user:{id:user.id,displayName:user.displayName,role:user.role}});
}
