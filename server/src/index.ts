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
    players.push({ id: socket.id, username: username, isReady: false });
    socket.join("lobby");
    io.emit("players", players);
  });

  socket.on("toggle-ready-lobby", (arg) => {
    const playerIdx = players.findIndex((player) => player.id === socket.id);
    if (playerIdx < 0) return;
    players[playerIdx].isReady = !players[playerIdx].isReady;
    io.emit("players", players);

    const isAllReady = players.every((player) => player.isReady === true);
    if (isAllReady) {
      io.to("lobby").emit("start-game");
    }
  });

  socket.on("leave-lobby", () => {
    players = players.filter((player) => player.id !== socket.id);
    io.emit("players", players);
  });

  socket.on("disconnect", (reason) => {
    players = players.filter((player) => player.id !== socket.id);
    io.emit("players", players);
  });
});

httpServer.listen(8000);
