import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import { PollController } from "./controllers/poll-controller";


export async function routes(app: FastifyInstance, options: FastifyPluginOptions) {
  // polls routes
  app.post('/polls', async (request: FastifyRequest, reply: FastifyReply) => {
    return new PollController().createPoll(request, reply);
  });

  app.get('/polls/:id', async (request, reply) => {
    return new PollController().showPoll(request, reply);
  });

  app.post('/polls/:pollId/votes', async (request: FastifyRequest, reply: FastifyReply) => {
    return new PollController().voteOnPoll(request, reply);
  });  
}