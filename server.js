const axios = require("axios");
var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
var express = require("express");
require("dotenv").config();
var app = express();
var cors = require("cors");
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { getTime } = require("./math");
let sockets = [];
let users = [];
let history = [];

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/build"));

app.get('/*', function (req, res) {
    res.sendFile(__dirname + '/build/index.html', function (err) {
        if (err) {
            res.status(500).send(err)
        }
    })
})

server.listen(5000, function () {
    console.log("listening --- server is running ...");
});
let GameState = "BET";
axios.defaults.headers.common["Authorization"] = process.env.SECRETCODE;

const READYTIME = 1000;
const BETINGTIME = 5000;
const GAMEENDTIME = 3000;
let startTime = Date.now();
let gameTime;
let currentNum;
let currentSecondNum;
let info = [];
let target;
// here is game playing
setInterval(() => {
    switch (GameState) {
        case "BET":
            if (Date.now() - startTime > BETINGTIME) {
                currentNum = 1;
                GameState = "READY";
                startTime = Date.now();
                gameTime = getRandom();
            }
            break;
        case "READY":
            if (Date.now() - startTime > READYTIME) {
                GameState = "PLAYING";
                startTime = Date.now();
            }
            break;
        case "PLAYING":
            var currentTime = (Date.now() - startTime) / 1000
            currentNum = 1 + 0.06 * currentTime + Math.pow((0.06 * currentTime), 2) - Math.pow((0.04 * currentTime), 3) + Math.pow((0.04 * currentTime), 4)
            currentSecondNum = currentNum;
            if (currentTime > gameTime) {
                currentSecondNum = 0;
                currentNum = target
                GameState = "GAMEEND";
                startTime = Date.now();
                for (let i in users) {
                    if (users[i].betted && !users[i].cashouted) {
                        if (users[i].target < currentNum) {
                            users[i].balance += users[i].target * users[i].betAmount;
                            users[i].cashouted = true;
                            users[i].cashAmount = users[i].target * users[i].betAmount;
                            users[i].betted = false;
                            sockets.map((socket) => {
                                if (socket.id === users[i].socketId) {
                                    socket.emit("finishGame", users[i]);
                                }
                            })
                        }
                    }
                    users[i].betted = false;
                    users[i].cashouted = false;
                    users[i].betAmount = 0;
                    users[i].cashAmount = 0;
                    sockets.map((socket) => {
                        if (socket.id === users[i].socketId) {
                            socket.emit("finishGame", users[i]);
                        }
                    })
                }
                sendInfo();
            }
            break;
        case "GAMEEND":
            if (Date.now() - startTime > GAMEENDTIME) {
                startTime = Date.now();
                GameState = "BET";
                info = [];
                history.unshift(target);
                io.emit("history", { history: history });
            }
            break;
    }

}, 20)

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// // Implement socket functionality
io.on("connection", function (socket) {
    sockets.push(socket);
    console.log("socket connected: " + socket.id);
    try {
        socket.on("disconnect", function () {
            console.log("socket disconnected: " + socket.id);
        });
        socket.on("enterRoom", (data) => {
            users[data.token] = {
                betted: false,
                cashouted: false,
                name: data.name,
                socketId: socket.id,
                betAmount: 0,
                balance: 3000,
                cashAmount: 0,
                auto: false,
                target: 0,
                type: data.type
            };
            sendInfo();
            io.emit("history", { history: history });
        })

        socket.on("playBet", (data) => {
            if (GameState === "BET") {
                if (users[data.token].balance - data.betAmount >= 0) {
                    users[data.token].betAmount = data.betAmount;
                    users[data.token].betted = true;
                    users[data.token].balance -= data.betAmount;
                    users[data.token].auto = data.auto;
                    users[data.token].target = data.target;
                    socket.emit("myBetState", users[data.token]);
                    sendInfo();
                } else {
                    socket.emit("error", "Your balance is not enough!");
                }
            } else {
                socket.emit("error", "You can't bet. Try again at next round!");
            }
        });

        socket.on("cashOut", (data) => {
            if (!users[data.token].cashouted && users[data.token].betted) {
                if (data.at <= currentSecondNum) {
                    users[data.token].cashouted = true;
                    users[data.token].cashAmount = data.at * users[data.token].betAmount;
                    users[data.token].betted = false;
                    users[data.token].balance += data.at * users[data.token].betAmount;
                    users[data.token].target = data.at;
                    socket.emit("finishGame", users[data.token]);
                    sendInfo();
                    socket.emit("success", `Successfully CashOuted ${Number(users[data.token].cashAmount).toFixed(2)}`)
                }
            } else {
                if (!users[data.token].betted) {
                    socket.emit("error", "You didn't betted this round!");
                } else if (users[data.token].cashouted)
                    socket.emit("error", "You already cashouted!");
            }
        });

        setInterval(() => {
            var time = Date.now() - startTime;
            socket.broadcast.emit("gameState", { currentNum, currentSecondNum, GameState, time, });
        }, 100);

    } catch (err) {
        socket.emit("error message", { "errMessage": err.message })
    }
});

const sendInfo = () => {
    info = [];
    for (let i in users) {
        if (users[i] && users[i].betted || users[i].cashouted) {
            info.push({
                username: users[i].name,
                betAmount: users[i].betAmount,
                cashOut: users[i].cashAmount,
                cashouted: users[i].cashouted,
                target: users[i].target
            })
        }
    }
    io.emit("bettedUserInfo", info);
}

function getRandom() {
    var r = Math.random();
    target = 1 / r;

    console.log(target);
    var time = getTime(target);
    return time;
}
