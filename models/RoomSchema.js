const mongoose = require('mongoose');


const RoomSchema = new mongoose.Schema({
  event_name: {
    type: String,
    required: true, 
  },
  owner_name: {
    type: String,
    required: true, 
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    default: null,
  },
  room_code: {
    type: String,
    required: true,  
    unique: true,    
  },
  created_date: {
    type: Date,
    default: Date.now, 
  },
});

const Room = mongoose.model('Room' , RoomSchema);
module.exports = Room;


// ============================================================
// PURPOSE: Defines the structure of a "Room" in the database.
// HOW IT WORKS:
//   A Room is created when someone hosts an event. It has:
//   - event_name: The name of the event (e.g., "Sarah's Wedding").
//   - owner_name: Who created the room.
//   - room_code: A unique 6-character code (e.g., "Ab3x9K") that
//     guests use to join the room.
//   - created_date: When the room was created (auto-set to now).
//   Mongoose uses this schema to create a "rooms" collection in MongoDB
//   and enforces that event_name, owner_name, and room_code are always provided.
// ============================================================