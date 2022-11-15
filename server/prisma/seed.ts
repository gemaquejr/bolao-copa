import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john.doe@gmail.com',
            avatarUrl: 'https://github.com/gemaquejr.png',
        }
    })

    const bet = await prisma.bet.create({
        data: {
            title: 'Example bet',
            code: 'BOL1234',
            ownerId: user.id,

            participants: {
                create: {
                    userId: user.id,
                }
            }
        }
    })

    await prisma.game.create({
        data: {
            date: '2022-11-15T14:03:53.201Z',
            firstTeamCountryCode: 'US',
            secondTeamCountryCode: 'BR',
        }
    })

    await prisma.game.create({
        data:{
            date: '2022-11-16T12:00:00.201Z',
            firstTeamCountryCode: 'DE',
            secondTeamCountryCode: 'AR',

            guesses: {
                create: {
                    firstTeamPoints: 2,
                    secondTeamPoints: 1,

                    participant: {
                        connect: {
                            userId_betId: {
                                userId: user.id,
                                betId: bet.id,
                            }
                        }
                    }
                }
            }
        },
    })
}

main()