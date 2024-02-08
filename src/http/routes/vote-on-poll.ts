import z from "zod";
import { client } from "../../lib/prisma";
import { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";

export async function voteOnPoll(app: FastifyInstance) {
  app.post('/polls/:pollId/votes', async (request, reply) => {
    const voteOnPollBody = z.object({
      pollOptionId: z.string().uuid(),
    })

    const voteOnPollParams = z.object({
      pollId: z.string().uuid()
    })
  
    const { pollOptionId } = voteOnPollBody.parse(request.body);
    const { pollId } = voteOnPollParams.parse(request.params);

    let { sessionId } = request.cookies;

    if (sessionId) {
      return reply.status(400).send({message: 'Você já votou nessa poll.'});
    } else {
      sessionId = randomUUID();

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60*60*24*30, // 30 days
        signed: true,
        httpOnly: true
      });
    }

    await client.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId
      }
    });

    return reply.status(201).send();
  });
}