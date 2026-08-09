/**
 * @file socket.js
 * @description Khởi tạo và quản lý Socket.io Server Real-time.
 */

const { Server } = require("socket.io");

let io;

const initSocket = (server) =>{
    io = new Server(server,{
        cors:{
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }
    })
    io.on('connection', (socket) =>{
        console.log(`User conneted: ${socket.id}`);

        socket.on('join_task',(taskId) =>{
            const roomName = `task:${taskId}`;
            socket.join(roomName);
            console.log(`User ${socket.id} joined room: ${roomName}`);
        })

        socket.on('disconnect', () =>{
            console.log(`User disconnected: ${socket.id}`);
        })
    })
    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket not initialized');
    }
    return io;
};

module.exports = {initSocket,getIo}