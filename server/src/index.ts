import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Player from "./interfaces/player";

let players: Player[] = [];

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  socket.emit("players", players);

  socket.on("join", (username: string) => {
    const newPlayer: Player = { id: socket.id, username: username };
    players.push(newPlayer);

    io.emit("players", players);
  });

  socket.on("disconnect", (reason) => {
    players = players.filter((player) => player.id !== socket.id);
    io.emit("players", players);
  });
});

httpServer.listen(8000);
