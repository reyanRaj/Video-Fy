//Importing needed packages
const express = require("express");
var http = require('http');
const app = express();
var server = http.createServer(app);
const { v4: uuidv4 } = require("uuid");
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server,{ debug:true });

//Specifying peer js Endpoint
app.use('/peerjs',peerServer);


//Setting EJS as the view Engine
app.set("view engine", "ejs");


// Setting Static Folder
app.use(express.static('public'));


// ROUTE:1 (GET) GOING TO ROOM 
app.get('/:room',(req,res)=>{
	res.render('room',{ roomId: req.params.room })
})


// ROUTE:2 (GET) HOME PAGE REDIRECTING TO ROOM PAGE
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`)
});


//Run when the socket is connected
io.on('connection',socket => {
  // Run whenever user emit 'join-room' socket
  socket.on('join-room',(roomId, userId)=> {
    // Joining the user to the roomId.
    socket.join(roomId);
    // Telling other user that new user was connected
    // by emitting their 'user-connected' socket.
    socket.broadcast.to(roomId).emit('user-connected', userId);

    socket.on('message',message => {
      io.to(roomId).emit('createdMessage',message);
    })
  })
})

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
