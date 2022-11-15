import Fastify from 'fastify';
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import shortUniqueId from 'short-unique-id'

const prisma = new PrismaClient({
    log: ['query'],
})

async function bootstrap() {
    const fastify = Fastify({
        logger: true,
    })

    await fastify.register(cors, {
        origin: true,
    })

    fastify.get('/bets/count', async () => {
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

    await fastify.listen({ port: 3333, host: '0.0.0.0' });
}

bootstrap()