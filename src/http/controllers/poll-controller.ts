import z from "zod";
import { client } from "../../lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "crypto";
import { redis } from "../../lib/redis";
import { voting } from "../../utils/voting-pub-sub";
import { PollsService } from "../../services/polls-service";

class PollController {
  async createPoll(request: FastifyRequest, reply: FastifyReply) {
    const createPollBody = z.object({
      title: z.string(),
      options: z.array(z.string())
    })

    const { title, options } = createPollBody.parse(request.body);
    const poll = await (new PollsService()).createPoll({ title, options });

    return reply.status(201).send({ data: poll });
  }

  async showPoll(request: FastifyRequest, reply: FastifyReply) {
    const showPollParams = z.object({
      id: z.string().uuid()
    })

    const { id } = showPollParams.parse(request.params);
    const poll = await (new PollsService()).showPoll(id);

    if (!poll) {
      return reply.status(400).send({ message: "Poll não encontrada" });
    }

    const result = await redis.zrange(id, 0, -1, 'WITHSCORES');
    const votes = result.reduce((obj, line, index) => {
      if (index % 2 === 0) {
        const score = result[index + 1];

        Object.assign(obj, { [line]: Number(score) });
      }

      return obj;
    }, {} as Record<string, number>);

    return reply.status(201).send({ data: poll, votes: votes });
  }

  async voteOnPoll(request: FastifyRequest, reply: FastifyReply) {

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
      return reply.status(400).send({ message: 'Você já votou nessa poll.' });
    } else {
      sessionId = randomUUID();

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
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

    const votes = await redis.zincrby(pollId, 1, pollOptionId);

    voting.publish(pollId, {
      pollOptionId,
      votes: Number(votes)
    });

    return reply.status(201).send();
  }
}

export { PollController };