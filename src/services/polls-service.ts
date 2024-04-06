import { client } from "../lib/prisma";
import { createPollType } from '../types/poll-types';

class PollsService {
  async getPolls() {

  }

  async showPoll(id: string) {
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

    return poll;
  }

  async createPoll({ title, options }: createPollType) {
    const poll = await client.poll.create({
      data: {
        title,
        options: {
          createMany: {
            data: options.map((option) => {
              return { title: option };
            })
          }
        }
      }
    });

    return poll;
  }

  async updatePoll() {

  }

  async destroyPoll() {

  }
}

export { PollsService };