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