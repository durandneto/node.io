var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io',{ rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] })(http);
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;


var nsp = io.of('/room1');



app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});


app.get('/room1', function(req, res){
    res.sendFile(__dirname + '/room1.html');
});


app.get('/transmit', function(req, res){
    res.sendFile(__dirname + '/transmit.html');
});



app.get('/message/:id/:message', function(req, res){
    io.emit('chat message', {text:req.params.message})
    res.end()
});


app.get('/message-room/:room/:message', function(req, res){
    console.log('/'+req.params.room)
    nsp.to(req.params.room).emit('chat message', {text:req.params.message})
    res.end()
});


io.on('connection', function(socket){
    // console.log(socket)
    console.log('connection', socket.id)
    
    socket.on('chat message', function(msg){
        io.to(socket.id).emit('chat message', {text: msg + ' => ' + socket.id })
    });

    socket.on('disconnect', function(){
        console.log('disconnected', socket.id)
     });
  });

nsp.on('connection', function(socket){
    socket.join('room1');
    socket.on('chat message', function(msg){
        nsp.to('room1').emit('chat message', {text: msg + ' => ' + socket.id })
    });

    socket.on('call', function(image){
        console.log('call')
        nsp.to('room1').emit('call',image)
    });
  console.log('someone connected to room 1');

  socket.on('disconnect', function(){
    socket.leave('room1');
    console.log('disconnected', socket.id)
 });
});


// if (cluster.isMaster) {
//     console.log(`Master ${process.pid} is running`);
  
//     // Fork workers.
//     for (let i = 0; i < numCPUs; i++) {
//       cluster.fork();
//     }
  
//     cluster.on('exit', (worker, code, signal) => {
//       console.log(`worker ${worker.process.pid} died`);
//     });
//   } else {
//     // Workers can share any TCP connection
//     // In this case it is an HTTP server
    http.listen(3000, function(){
        console.log('listening on *:3000');
      });
      
  
//     console.log(`Worker ${process.pid} started`);
//   }

