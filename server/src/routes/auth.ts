import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';

export async function authRoutes(fastify: FastifyInstance) {
    fastify.get('/bets/count', async () => {
        const count = await prisma.bet.count()

        return { count }
    })
}