const http = require('http');
const WebSocketServer = require('websocket').server;

const PORTs = 5000;
const users = [];

const server = http.createServer((req, res) => {
    console.log("Inside Server");
    res.writeHead(404);
    res.end();
});

server.listen(PORTs, () => {
    console.log(`Server running at port: ${PORTs}`);
});

const wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', (request) => {
    const connection = request.accept(null, request.origin);
    let username = null;

    connection.on('message', (message) => {
        const parsedMessage = JSON.parse(message.utf8Data);

        if (parsedMessage.type === 'SET_USERNAME') {
            username = parsedMessage.username;
            if (!users.includes(username)) {
                users.push(username);
            }
            broadcastUserList();
        }

        if (parsedMessage.type === 'MESSAGE') {
            const messageToSend = {
                type: 'MESSAGE',
                username: username,
                text: parsedMessage.text,
                timestamp: new Date().toISOString()
            };
            broadcastMessage(JSON.stringify(messageToSend));
        }
    });

    connection.on('close', (reasonCode, description) => {
        console.log("Client disconnected");
        if (username) {
            users.splice(users.indexOf(username), 1);
            broadcastUserList();
        }
    });

    function broadcastUserList() {
        const userListMessage = JSON.stringify({
            type: 'USER_LIST',
            users: users
        });
        wsServer.connections.forEach((conn) => {
            if (conn.readyState === WebSocketServer.OPEN) {
                conn.sendUTF(userListMessage    );
            }
        });
    }

    function broadcastMessage(data) {
        wsServer.connections.forEach((conn) => {
            if (conn.readyState === WebSocketServer.OPEN) {
                conn.sendUTF(data);
            }
        });
    }
});




// const http = require('http')
// const WebSocketServer = require('websocket').server

// const PORT = 5000

// const server = http.createServer((req, res)=> {
//     console.log("Inside Server");
//     // res.writeHead(404)
//     // res.end();
// })

// server.listen(PORT,()=>{
//     console.log(`Server running at port : ${PORT}`);
// })

// const wsServer = new WebSocketServer({
//     httpServer:server
// });

// wsServer.on('request',(request)=>{
//     const connection = request.accept(null,request.origin);

//     connection.on('message',(message)=>{
//         if(!users.includes(message.username)){
//             users.push(message.username)
//         }
//         if(message.type =='utf8'){
//             wsServer.broadcast(message.utf8Data);
//             wsServer.broadcast
//         }
//     })

//     connection.on('close',(reasonCode, description)=> {
//         console.log("Client disconnected");
//     })

//     wsServer.broadcast = (data) =>{
//         wsServer.connections.forEach((connection)=> {
//             connection.sendUTF(data)
//         })
//     }
// })