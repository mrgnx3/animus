/**
 * Created by ciaran.whyte on 7/7/17.
 */
document.addEventListener("DOMContentLoaded", function (event) {

    var playerName = readCookie('animusUser');
    var gameName = document.getElementById('lobby').getAttribute('gameName');
    var messageInput = document.getElementById("chatInputField");
    var sendMessageButton = document.getElementById("sendMessage");

    var chatContent = document.getElementById("chatContent");
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    function submitMessage() {
        socket.emit('send_message', {
            message: messageInput.value,
            username: playerName,
            game_name: gameName
        });
        messageInput.value = '';
    }

    sendMessageButton.onclick = submitMessage;
    messageInput.onkeypress = function (event) {
        if (event.keyCode === 13) {
            submitMessage();
        }
    };

    socket.on('new_message', function (data) {
        document.getElementById("chatContent").innerHTML += '<b>' + data.username + ': </b>' + data.message + '<br />';
    });


    socket.emit('join_lobby', {game_name: gameName, username: playerName});
});

var modal = document.getElementById('heroRaceSelector');
var raceClaimButtons = document.getElementsByClassName("claimRaceButton");
var span = document.getElementsByClassName("close")[0];

for (var i = 0, l = raceClaimButtons.length; i < l; i++) {
    raceClaimButtons[i].onclick = function() {
        modal.style.display = "block";
    };
}

span.onclick = function() {
    modal.style.display = "none";
};

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};