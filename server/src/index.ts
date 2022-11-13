import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Card from "./interfaces/card";
import Game from "./interfaces/game";
import GameStatus from "./interfaces/game-status";
import LobbyPlayer from "./interfaces/lobby-player";
import { shuffleCards } from "./utils/card";
import cardsData from "./utils/card-data";
import dotenv from "dotenv";

dotenv.config();

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

    // Find player that set the cards
    const playerIdx = lobbyPlayers.findIndex(
      (player) => player.id === socket.id
    );

    // Remove cards from player hands
    game.players[playerIdx].cards = game.players[playerIdx].cards.filter(
      (c) => {
        const isExist = cards.find(
          (cc) => cc.rank === c.rank && cc.suit === c.suit
        );
        if (isExist) return false;
        return true;
      }
    );

    // Increment turn to next turn
    if (playerIdx === lobbyPlayers.length - 1) {
      game.turn = lobbyPlayers[0].id;
    } else {
      game.turn = lobbyPlayers[playerIdx + 1].id;
    }

    const currentGameStatus = getCurrentGameStatus();
    if (!currentGameStatus) return null;

    // Emit the updated game status
    io.to("lobby").emit("game-status", currentGameStatus);

    // Check if the player cards is empty and game done
    if (game.players[playerIdx].cards.length <= 0) {
      io.to("lobby").emit("game-over", game.players[playerIdx].id);
      io.socketsLeave("lobby");
      lobbyPlayers = [];
      io.emit("players", lobbyPlayers);
      return;
    }
  });

  socket.on("pass-turn", (arg) => {
    if (!game) return;

    game.board = [];

    const turnIdx = lobbyPlayers.findIndex(
      (player) => player.id === game?.turn
    );
    if (turnIdx === lobbyPlayers.length - 1) {
      game.turn = lobbyPlayers[0].id;
    } else {
      game.turn = lobbyPlayers[turnIdx + 1].id;
    }

    const currentGameStatus = getCurrentGameStatus();
    if (!currentGameStatus) return null;

    io.to("lobby").emit("game-status", currentGameStatus);
  });
});

httpServer.listen(process.env.PORT || 8000);
