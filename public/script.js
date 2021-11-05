// Global Variables
let myVideoStream;
const socket = io('/');
const html = document.querySelector('html');
const toogleChatBtn = document.getElementById('btn_toggle_chat');
const spalshScren = document.querySelector('.splash-screen');
const btnMuteAudio = document.getElementById('btn-mute-audio');
const btnMuteVideo = document.getElementById('btn-mute-video');
const sendMsg = document.getElementById('btn_send_msg');
const rightSection = document.querySelector('.main__right');
const chatWindow = document.querySelector('.main__chat__window');
const msgList = document.querySelector('.messages');
const msgInput = document.getElementById('message-text');
const leftSection = document.querySelector('.main__left');
const videoGrid = document.getElementById('video-grid');
const myVideoObj = document.createElement('video');
myVideoObj.muted = true;

setTimeout(()=>{
	spalshScren.style.display= 'none'
}, 2000);

var peer = new Peer(undefined, {
	path: '/peerjs',
	host: '/',
	port: '3000'
}); 

// Accessing the user Camera (CALLING)
navigator.mediaDevices.getUserMedia({
	video: true,
	audio:true
}).then((stream) =>{
	myVideoStream = stream;
	addVideoStream(myVideoObj,stream);

	// peer.on('call',(call) => {
	// 	call.answer(stream);
	// 	const video = document.createElement('video');
	// 	call.on('stream', (otherUserStream)=> {	
	// 		console.log('I got the other user stream.')
	// 		addVideoStream(video,otherUserStream);
 //    	});
	// })

	socket.on('user-connected', (userId)=> {
		connectToNewUser(userId, stream)
	});

});
/* RECEIVING THE CALL */
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
peer.on('call',(call) => {
	getUserMedia({video: true, audio: true}, (stream)=>{
		call.answer(stream);
		const video = document.createElement('video');
		call.on('stream', (otherUserStream)=> {	
			console.log('I got the other user stream.')
			addVideoStream(video,otherUserStream);
    	});
	})
})


peer.on('open',id => {
	//Emitting join room socket
	socket.emit('join-room', ROOM_ID, id);
})

socket.on('createdMessage',message => {
	msgList.innerHTML += `<li class="message"><b>User</b><br><p>${message}</p></li>`;
	scrollToBottom();
})

//Event Listener
sendMsg.onclick = () => {
	if(msgInput.value.length !== 0){
		socket.emit('message',msgInput.value);
		msgInput.value = '';	
	}
}
btnMuteAudio.onclick = ()=>{
	muteUnmute();
}
btnMuteVideo.onclick = ()=>{

}


toogleChatBtn.onclick = ()=>{

	if(rightSection.style.display !== 'none'){
		rightSection.style.display = 'none'
		leftSection.style.flexGrow = 1;
	}else{
		rightSection.style.display = 'flex';
		leftSection.style.flexGrow = 0.8;		
	}
}
html.addEventListener('keydown',(e)=>{
	if(e.which== 13 && msgInput.value.length !== 0){
		socket.emit('message',msgInput.value);
		msgInput.value = '';	
	}
})

//Helper Functions
const addVideoStream = (video, stream)=>{
	video.srcObject = stream;
	video.addEventListener('loadmetadata',()=>{
		video.play();
	})
	video.play();
	videoGrid.append(video);
}
const connectToNewUser = (id, stream)=> {
	console.log('new user connected'+ id)
	const call = peer.call(id, stream);
	const video = document.createElement('video');
	call.on('stream',(otherUserStream) => {
		addVideoStream(video,otherUserStream);
	})
}

const scrollToBottom = () => {
	chatWindow.scrollTop = chatWindow.scrollHeightWe;
}

const muteUnmute = () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled;
	if(enabled){
		myVideoStream.getAudioTracks()[0].enabled = false;
		setUnmuteButton();
	}else{
		myVideoStream.getAudioTracks()[0].enabled = true;
		setMuteButton();
	}
}

const setUnmuteButton = () => {
	const html = `
	<div class="main__controls__button" id="btn-mute-audio">
                  <i class="fas fa-microphone-slash"></i>
                  <span>Un Mute</span>
                </div>
	`;
	btnMuteAudio.innerHTML = html;
}

const setMuteButton = () => {
	const html = `
	<div class="main__controls__button" id="btn-mute-audio">
                  <i class="fas fa-microphone"></i>
                  <span>Mute</span>
                </div>
	`;
	btnMuteAudio.innerHTML = html;
}