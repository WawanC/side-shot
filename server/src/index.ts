import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Player from "./interfaces/player";

let players: Player[] = [];

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("get-players", (arg) => {
    socket.emit("players", players);
  });

  socket.on("join-lobby", (username: string) => {
    players.push({ id: socket.id, username: username });
    socket.join("lobby");
    io.emit("players", players);
  });

  socket.on("leave-lobby", () => {
    players = players.filter((player) => player.id !== socket.id);
    io.emit("players", players);
  });
});

httpServer.listen(8000);
