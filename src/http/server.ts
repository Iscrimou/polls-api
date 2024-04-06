import fastify from "fastify";
import cookie from "@fastify/cookie";
import websocket from "@fastify/websocket";
import { pollResults } from "./ws/poll-results";
import { routes } from "./routes";

const app = fastify();

app.register(cookie, {
  secret: "polls-api",
  hook: 'onRequest'
});

app.register(websocket);
app.register(routes);

app.register(pollResults);

app.listen({ port: 3333 }).then(() => {
  console.log('listen 3333');
});