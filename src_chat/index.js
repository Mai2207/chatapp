const http = require('http')
const express = require('express')
const path = require('path')
const socketio = require('socket.io')
const Filter =require('bad-words')
const moment = require('moment')
require('./db/mongoose')

const Message = require('./models/message')
const {generateMessage} = require('./utlis/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utlis/users')

const app=express()
const server =http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

app.use(express.json())

io.on('connection',(socket)=>{
    console.log('New websocket connection')

    socket.on('join',(options,callback)=>{
        
     const {error,user} = addUser({id:socket.id,...options})
     if(error){
         return callback(error)

     }
    
        socket.join(user.room)

        Message.find({'roomname':user.room},(error,docs)=>{
            if(error){
                return handleError(error)
            }
           //  console.log(docs)
            socket.emit('chatHistory',docs)
    
        }).sort({'sendingtime':-1})

        socket.emit('messagewelcome',generateMessage('Admin','Welcome!'))
        
        
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))

        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
         
    })

    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)
        const filter= new Filter()

        if(filter.isProfane(message)){
            return callback('Profenity is not allowed!')
        }

       io.to(user.room).emit('message',generateMessage(user.username,message))
       const {createdAt} = generateMessage(user.username,message)
       const newMessage = new Message({
        sendername:user.username,
        roomname:user.room,
        messagetext:message,
        sendingtime : moment(createdAt).format(' DD:MMM:YYYY h:mm a')
    })
    newMessage.save()
       callback('Delivered!')
   })

   socket.on('disconnect',()=>{
       const user = removeUser(socket.id)
       if(user){
        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users: getUsersInRoom(user.room)
        })

       }
       
   })

   


})


server.listen(3000, () => {
    console.log('Server is up on port 3000.')
})