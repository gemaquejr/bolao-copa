import { FastifyInstance } from 'fastify';
import shortUniqueId from 'short-unique-id'
import { z } from 'zod'
import { prisma } from '../lib/prisma';

export async function betRoutes(fastify: FastifyInstance) {
    fastify.get('/bet/count', async () => {
        const count = await prisma.bet.count()

        return { count }
    })

    fastify.post('/bets', async (request, reply) => {
        const createBetBody = z.object({
            title: z.string(),
        })

        const { title } = createBetBody.parse(request.body)

        const generate = new shortUniqueId({ length: 7 })
        const code = String(generate()).toUpperCase()

        await prisma.bet.create({
            data: {
                title,
                code
            }
        })

        return reply.status(201).send({ code })
    })
}