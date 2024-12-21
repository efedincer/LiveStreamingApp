
const connection = new signalR.HubConnectionBuilder()
  .withUrl("/liveStreamHub")
  .build();

let localStream;
let peerConnection;
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// HTML öğelerini al
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const userId = document.getElementById('userId');

// PeerConnection kurma fonksiyonu
function createPeerConnection() {
  peerConnection = new RTCPeerConnection(configuration);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      connection.invoke('SendIceCandidate', userId.value, JSON.stringify(event.candidate));
    }
  };

  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
}

// Video akışını başlat
navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
  localVideo.srcObject = stream;
  localStream = stream;
});

// WebRTC sinyalleme
connection.on("ReceiveOffer", async (offer) => {
  createPeerConnection();
  await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(offer)));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  connection.invoke("SendAnswer", userId.value, JSON.stringify(answer));
});

connection.on("ReceiveAnswer", async (answer) => {
  const remoteDesc = new RTCSessionDescription(JSON.parse(answer));
  await peerConnection.setRemoteDescription(remoteDesc);
});

connection.on("ReceiveIceCandidate", async (candidate) => {
  await peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
});

// Arama başlatma
document.getElementById('startCallButton').addEventListener('click', async () => {
  createPeerConnection();
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  connection.invoke("SendOffer", userId.value, JSON.stringify(offer));
});

connection.on("UserJoined", (connectionId) => {
  const message = `${connectionId} odaya katıldı.`;
  $("#messages").append(`<div>${message}</div>`);
});

connection.on("ReceiveMessage", (message) => {
  $("#messages").append(`<div>${message}</div>`);
});

$("#joinButton").click(() => {
  const roomName = $("#roomName").val();
  connection.start().then(() => {
    connection.invoke("JoinRoom", roomName);
  });
});

$("#sendButton").click(() => {
  const message = $("#messageInput").val();
  const roomName = $("#roomName").val();
  connection.invoke("SendMessage", roomName, message);
  $("#messageInput").val("");
});


connection.start().catch(err => console.error(err.toString()));
