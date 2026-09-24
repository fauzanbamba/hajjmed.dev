import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { ZodError } from 'zod';
import { config } from './config.js';
import { authRoutes } from './routes/auth.js';
import { pilgrimRoutes } from './routes/pilgrims.js';
import { appointmentRoutes } from './routes/appointments.js';
import { clinicalRoutes } from './routes/clinical.js';
import { adminRoutes } from './routes/admin.js';
import { practitionerRoutes } from './routes/practitioners.js';
import { communicationRoutes } from './routes/communications.js';
import { pharmacyRoutes } from './routes/pharmacy.js';
import { db } from './lib/db.js';

export async function buildApp(){
  const app=Fastify({logger:{redact:['req.headers.authorization','body.password','body.code','body.refreshToken']},trustProxy:true,requestIdHeader:'x-request-id'});
  await app.register(helmet);await app.register(cors,{origin:config.APP_ORIGIN,credentials:true});await app.register(rateLimit,{max:100,timeWindow:'1 minute'});await app.register(jwt,{secret:config.JWT_ACCESS_SECRET});
  await app.register(swagger,{openapi:{info:{title:'HajjMed 2027 Clinical API',version:'0.2.0'},components:{securitySchemes:{bearerAuth:{type:'http',scheme:'bearer',bearerFormat:'JWT'}}}}});await app.register(swaggerUi,{routePrefix:'/docs'});
  app.get('/health/live',async()=>({status:'ok',service:'hajjmed-api'}));
  app.get('/health/ready',async(req,reply)=>{try{await db.user.count({take:1});return {status:'ready',service:'hajjmed-api',database:'supabase'}}catch(error){req.log.error(error);return reply.code(503).send({status:'unavailable',service:'hajjmed-api',database:'failed'})}});
  app.get('/health',async()=>({status:'ok',service:'hajjmed-api'}));
  await app.register(authRoutes,{prefix:'/api/v1/auth'});await app.register(practitionerRoutes,{prefix:'/api/v1/practitioners'});await app.register(pilgrimRoutes,{prefix:'/api/v1/pilgrims'});await app.register(appointmentRoutes,{prefix:'/api/v1/appointments'});await app.register(clinicalRoutes,{prefix:'/api/v1/clinical'});await app.register(communicationRoutes,{prefix:'/api/v1/communications'});await app.register(pharmacyRoutes,{prefix:'/api/v1/pharmacy'});await app.register(adminRoutes,{prefix:'/api/v1/admin'});
  app.setErrorHandler((error,req,reply)=>{if(error instanceof ZodError)return reply.code(422).send({error:{code:'VALIDATION_ERROR',message:'Request validation failed',requestId:req.id,details:error.issues}});const e=error as any;const status=e.statusCode??(e.code==='P2002'?409:500);if(status>=500)req.log.error(error);return reply.code(status).send({error:{code:e.code??'INTERNAL_ERROR',message:status>=500?'An unexpected error occurred':e.message,requestId:req.id}})});
  return app;
}
