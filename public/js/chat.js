const socket = io()

//Elements 
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
// const $sendLocationButton =document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
//server(emit)->client(receive)--acknowledgement -->server
//client(emit)->server(receive)--acknowledgement -->client


//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
// const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room }= Qs.parse(location.search,{ ignoreQueryPrefix:true})

const autoscroll =()=>{
    //New message element
    const $sendMessage = $messages.lastElementChild


    //height of the new message
    const newMessageStyles = getComputedStyle($sendMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $sendMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight


    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight

    }

}

//chathistory
socket.on('chatHistory',(data)=>{
    data.forEach(element => {
        // console.log(element)
        const html = Mustache.render(messageTemplate,{
            username : element.sendername,
            message : element.messagetext,
            createdAt:element.sendingtime
        })
        $messages.insertAdjacentHTML('afterbegin',html)

        
    })
    autoscroll()

})
socket.on('messagewelcome',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message : message.text,
        createdAt:moment (message.createdAt).format('DD:MMM:YYYY h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
    


})
socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message : message.text,
        createdAt:moment (message.createdAt).format('DD:MMM:YYYY h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()


})

socket.on('roomData',({ room, users})=>{
    const html =Mustache.render(sidebarTemplate,{
        room,
        users

    })
    document.querySelector('#sidebar').innerHTML = html

})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    //disable


    const message =e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        //enable
        if(error){
            return console.log(error)
        }
        console.log(' message delivered')
    })
})

socket.emit('join',{username, room },(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }

})
