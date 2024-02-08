import z from "zod";
import { client } from "../../lib/prisma";
import { FastifyInstance } from "fastify";

export async function showPoll(app: FastifyInstance) {
  app.get('/polls/:id', async (request, reply) => {
    const showPollParams = z.object({
      id: z.string().uuid()
    })
  
    const { id } = showPollParams.parse(request.params);
  
    const poll = await client.poll.findUnique({
      where: {
        id: id
      },
      include: {
        options: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
  
    return reply.send({ data: poll });
  });
}