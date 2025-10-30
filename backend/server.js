const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/project');
const whatsappRoutes = require('./routes/whatsapp');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Inject io into whatsappController
require('./controllers/whatsappController').setIo(io);

// Connect to MongoDB
connectDB();




// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Socket.IO authentication and connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  console.log('Socket auth attempt, token present:', !!token);
  if (!token) {
    console.log('No token provided for socket auth');
    return next(new Error('Authentication error'));
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    socket.userId = decoded.userId || decoded.id;
    console.log('Socket auth successful for user:', socket.userId);
    next();
  } catch (error) {
    console.log('Socket auth failed:', error.message);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  socket.on('join_project', (projectId) => {
    // Validate project ownership
    const Project = require('./models/Project');
    Project.findOne({ _id: projectId, user: socket.userId }).then(project => {
      if (project) {
        socket.join(projectId);
        console.log(`User ${socket.userId} joined project ${projectId}`);
      } else {
        socket.emit('error', 'Project not found or access denied');
      }
    }).catch(error => {
      console.error('Error validating project:', error);
      socket.emit('error', 'Server error');
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

// Export io for use in controllers
module.exports.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
