const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Room = require('../models/RoomSchema');
const verifyAccountToken = require('../Middleware/verifyAccountToken');  

// Function to generate a random 6-character room code (letters and numbers)
function generateRoomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let roomCode = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    roomCode += characters[randomIndex];
  }
  return roomCode;
}

router.post('/create', verifyAccountToken, async (req, res) => {
    const { eventName, ownerName } = req.body;
  
    // Generate a random 6-digit room code
    const roomCode = generateRoomCode();
  
    // Get the current date and time
    const createdDate = new Date();
  
    // Log the received data, room code, and created date
    console.log('Event Name:', eventName);
    console.log('Owner Name:', ownerName);
    console.log('Generated Room Code:', roomCode);
    console.log('Created Date:', createdDate);
  
    // Create a new Room document
    const room = new Room({
      event_name: eventName,
      owner_name: ownerName,
      owner: req.accountId,
      room_code: roomCode,
      created_date: createdDate,
    });
  
    try {
      // Save the room to the database
      const savedRoom = await room.save();
      console.log('Room saved to database:', savedRoom);
  
      // Send a response back to the client with room details
      res.status(200).json({
        message: 'Room details received and saved successfully!',
        room: savedRoom,  // Send the entire room object back
      });
    } catch (err) {
      console.error('Error saving room to database:', err);
      res.status(500).json({ message: 'Error saving room details' });
    }
  });

router.get('/check-room/:eventCode', async (req, res) => {
    const { eventCode } = req.params;
    try {
      const room = await Room.findOne({ room_code: eventCode });
      if (room) {
        res.status(200).json({ message: 'Room found', room });
      } else {
        res.status(404).json({ message: 'Room not found' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Error checking room', error: err });
    }
  });


module.exports = router;


// ============================================================
// PURPOSE: Handles creating event rooms and checking if a room exists.
// HOW IT WORKS:
//   This file defines 2 API endpoints:
//
//   POST /create:
//     1. Receives eventName and ownerName from the request body.
//     2. Generates a random 6-character code (e.g., "Ab3x9K") using
//        letters and numbers.
//     3. Creates a Room document and saves it to MongoDB.
//     4. Returns the saved room (including the room_code) to the client.
//
//   GET /check-room/:eventCode:
//     1. Takes a room code from the URL (e.g., /check-room/Ab3x9K).
//     2. Looks up the database for a room with that code.
//     3. If found, returns the room details. If not, returns 404.
//
//   Flow: Host creates room -> gets code -> shares code with guests ->
//         guests use code to check-room and join.
// ============================================================
