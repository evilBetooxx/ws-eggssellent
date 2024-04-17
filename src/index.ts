import express from "express";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import mqtt from "mqtt";

dotenv.config();

const app = express();

const port = process.env.PORT || 3001;

app.use(express.json());
app.use(
  cors({
    origin: "https://eggssellent-frontend.vercel.app",
    methods: ["GET", "POST", "PUT", "OPTIONS", "PREFLIGHT", "PATCH", "DELETE"],
    credentials: true,
  })
);

const server = app.listen(port, () => {
  console.log("Servidor WebSocket corriendo en el puerto:", port);
});

const io: Server = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket: any) => {
  // console.log("Usuario Conectado con token:", socket.id);

  const client = mqtt.connect("broker.emqx.io", {
    username: "emqx",
    password: "public"
  });

  socket.on("startup", (id: String) => {
    console.log("Suscrito a la incubadora: ", id);
    client.subscribe(`/${id}`);
  });

  client.on('message', (topic, payload) => {
    console.log('Mensaje recibido:', topic, payload.toString())
    io.emit("data", payload.toString());
  })

  socket.on("disconnect", (id: String) => {
    console.log("Usuario Desconectado", socket.id);
    client.unsubscribe(`/${id}`);
  });
});
