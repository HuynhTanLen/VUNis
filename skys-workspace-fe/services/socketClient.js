import { io } from 'socket.io-client';

let socket;

export const getSocket = () => {
    if (typeof window === 'undefined') return null;

    if (!socket) {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
        socket = io(socketUrl, {
            withCredentials: true,
            autoConnect: true,
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('⚡ Đã kết nối Socket.io Real-time:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('❌ Đã ngắt kết nối Socket.io Real-time');
        });
    }
    return socket;
};

export const joinTaskRoom = (taskId) => {
    const s = getSocket();
    if (s && taskId) {
        s.emit('join_task', taskId);
    }
};

export const leaveTaskRoom = (taskId) => {
    const s = getSocket();
    if (s && taskId) {
        s.emit('leave_task', taskId);
    }
};
