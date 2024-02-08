import fastify from "fastify";
import { createPoll } from "./routes/create-poll";
import { showPoll } from "./routes/show-poll";
import { voteOnPoll } from "./routes/vote-on-poll";
import cookie from "@fastify/cookie";

const app = fastify();

app.register(cookie, {
  secret: "polls-api",
  hook: 'onRequest'
});

app.register(createPoll);
app.register(showPoll);
app.register(voteOnPoll);

app.listen({ port: 3333 }).then(() => {
  console.log('listen 3333');
});