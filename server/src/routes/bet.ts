import { FastifyInstance } from 'fastify';
import shortUniqueId from 'short-unique-id'
import { z } from 'zod'
import { prisma } from '../lib/prisma';
import { authenticate } from '../plugins/authenticate';

export async function betRoutes(fastify: FastifyInstance) {
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

        try {
            await request.jwtVerify()

            await prisma.bet.create({
                data: {
                    title,
                    code,
                    ownerId: request.user.sub,

                    participants: {
                        create: {
                            userId: request.user.sub
                        }
                    }
                }
            })
        } catch {
            await prisma.bet.create({
                data: {
                    title,
                    code
                }
            })
        }

        return reply.status(201).send({ code })
    })

    fastify.post('/bets/join', {
        onRequest: [authenticate]
    }, async (request, reply) => {
        const joinBetBody = z.object({
            code: z.string(),        
        })

        const { code } = joinBetBody.parse(request.body)

        const bet = await prisma.bet.findUnique({
            where: {
                code,
            },
            include: {
                participants: {
                    where: {
                        userId: request.user.sub,
                    }
                }
            }
        })

        if (!bet) {
            return reply.status(400).send({
                message: 'Bet not found.'
            })
        }

        if (bet.participants.length > 0) {
            return reply.status(400).send({
                message: 'You already joined this Bet.'
            })
        }

        if (!bet.ownerId) {
            await prisma.bet.update({
                where: {
                    id: bet.id,
                },
                data: {
                    ownerId: request.user.sub,
                }
            })
        }

        await prisma.participant.create({
            data: {
                betId: bet.id,
                userId: request.user.sub,
            }
        })

        return reply.status(201).send();
    })

    fastify.get('/bets', {
        onRequest: [authenticate]
    }, async (request) => {
        const bets = await prisma.bet.findMany({
            where: {
                participants: {
                    some: {
                        userId: request.user.sub,
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        participants: true,
                    }
                },
                participants: {
                    select: {
                        id: true,

                        user: {
                            select: {
                                avatarUrl: true,
                            }
                        }
                    },
                    take: 4,                    
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        })

        return { bets }
    })

    fastify.get('/bets/:id', {
        onRequest: [authenticate]
    }, async (request) => {
        const getBetParams = z.object({
            id: z.string(),        
        })

        const { id } = getBetParams.parse(request.params)

        const bet = await prisma.bet.findUnique({
            where: {
                id, 
            },
            include: {
                _count: {
                    select: {
                        participants: true,
                    }
                },
                participants: {
                    select: {
                        id: true,

                        user: {
                            select: {
                                avatarUrl: true,
                            }
                        }
                    },
                    take: 4,                    
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        })

        return { bet }
    })
}