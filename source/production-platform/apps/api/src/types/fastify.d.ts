import '@fastify/jwt';
import type { Role } from '@prisma/client';
declare module '@fastify/jwt' { interface FastifyJWT { payload:{sub:string;role:Role;organizationId?:string;pilgrimId?:string;sessionId:string}; user:{sub:string;role:Role;organizationId?:string;pilgrimId?:string;sessionId:string} } }
