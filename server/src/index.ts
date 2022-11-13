import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Card from "./interfaces/card";
import Game from "./interfaces/game";
import GameStatus from "./interfaces/game-status";
import LobbyPlayer from "./interfaces/lobby-player";
import { shuffleCards } from "./utils/card";
import cardsData from "./utils/card-data";

let lobbyPlayers: LobbyPlayer[] = [];
let game: Game | null = null;

const getCurrentGameStatus = (): GameStatus | null => {
  if (!game) return null;
  return {
    players: game.players.map((player) => ({
      id: player.id,
      username: player.username,
      cardsCount: player.cards.length
    })),
    turn: game.turn,
    board: game.board
  };
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("get-players", (arg) => {
    socket.emit("players", lobbyPlayers);
  });

  socket.on("join-lobby", (username: string) => {
    lobbyPlayers.push({ id: socket.id, username: username, isReady: false });
    socket.join("lobby");
    io.emit("players", lobbyPlayers);
  });

  socket.on("toggle-ready-lobby", (arg) => {
    const playerIdx = lobbyPlayers.findIndex(
      (player) => player.id === socket.id
    );
    if (playerIdx < 0) return;
    lobbyPlayers[playerIdx].isReady = !lobbyPlayers[playerIdx].isReady;
    io.emit("players", lobbyPlayers);

    const isAllReady = lobbyPlayers.every((player) => player.isReady === true);
    if (isAllReady && lobbyPlayers.length === 2) {
      io.to("lobby").emit("start-game");

      game = {
        players: lobbyPlayers.map((player) => ({
          id: player.id,
          username: player.username,
          cards: []
        })),
        turn: lobbyPlayers[0].id,
        board: []
      };

      const shuffledDeck = shuffleCards(cardsData);

      game.players.forEach((player) => {
        for (let i = 0; i < 13; i++) {
          const card = shuffledDeck.pop();
          if (card) player.cards.push(card);
        }
      });

      console.log(`Game : ${game}`);
    }
  });

  socket.on("leave-lobby", () => {
    lobbyPlayers = lobbyPlayers.filter((player) => player.id !== socket.id);
    io.emit("players", lobbyPlayers);
  });

  socket.on("disconnect", (reason) => {
    lobbyPlayers = lobbyPlayers.filter((player) => player.id !== socket.id);
    io.emit("players", lobbyPlayers);
  });

  socket.on("get-cards", (arg) => {
    if (!socket.rooms.has("lobby") || !game) return;

    const player = game.players.find((player) => player.id === socket.id);
    if (!player) return;
    socket.emit("cards", player.cards);

    const currentGameStatus = getCurrentGameStatus();
    if (!currentGameStatus) return null;
    socket.emit("game-status", currentGameStatus);
  });

  socket.on("set-board", (cards: Card[]) => {
    if (!game) return;
    game.board = cards;

    const idx = lobbyPlayers.findIndex((player) => player.id === game?.turn);
    if (idx === lobbyPlayers.length - 1) {
      game.turn = lobbyPlayers[0].id;
    } else {
      game.turn = lobbyPlayers[idx + 1].id;
    }

    const currentGameStatus = getCurrentGameStatus();
    if (!currentGameStatus) return null;

    io.to("lobby").emit("game-status", currentGameStatus);
  });

  socket.on("pass-turn", (arg) => {
    if (!game) return;

    game.board = [];

    const idx = lobbyPlayers.findIndex((player) => player.id === game?.turn);
    if (idx === lobbyPlayers.length - 1) {
      game.turn = lobbyPlayers[0].id;
    } else {
      game.turn = lobbyPlayers[idx + 1].id;
    }

    const currentGameStatus = getCurrentGameStatus();
    if (!currentGameStatus) return null;

    io.to("lobby").emit("game-status", currentGameStatus);
  });
});

httpServer.listen(8000);
