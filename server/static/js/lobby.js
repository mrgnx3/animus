document.addEventListener("DOMContentLoaded", function (event) {
    let messageInput = document.getElementById("chatInputField");
    let sendMessageButton = document.getElementById("sendMessage");
    let playerName = readCookie('animusUser');
    let gameName = document.getElementById('lobby').getAttribute('gameName');

    let chatContent = document.getElementById("chatContent");
    let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

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

    socket.on('start_game', function () {
        function startGame(in_seconds){
            if (in_seconds > 0) {
                setTimeout(function () {
                    document.getElementById("chatContent").innerHTML += '<b> ' + in_seconds + '</b><br />';
                    in_seconds--;
                    startGame(in_seconds);
                }, 1000);
            } else {
                 window.location = location.origin + '/game/' + gameName;
            }
        }
        document.getElementById("chatContent").innerHTML += '<b>#</b>Starting game in . . .<br />';
        startGame(6);
    });

    socket.on('lobby_race_lock', function (data) {
        let claimRaceButtons = document.getElementsByClassName('claimRaceButton');
        for (let i = 0, l = claimRaceButtons.length; i < l; i++) {
            if (claimRaceButtons[i].getAttribute('race') === data.race) {
                claimRaceButtons[i].onclick = null;
                claimRaceButtons[i].style.background = '#566963';
                claimRaceButtons[i].innerHTML = data.player;
            } else if (data.player === playerName) {
                claimRaceButtons[i].onclick = null;
                claimRaceButtons[i].style.background = '#566963';
            }
        }
    });

    socket.emit('join_lobby', {game_name: gameName, username: playerName});

    function heroSelected(race, heroType) {
        socket.emit('hero_selected', {
            race: race,
            hero_type: heroType,
            game_name: gameName,
            player_name: playerName
        });
        document.getElementById('heroRaceSelector-' + race).style.display = "none";
    }

    let raceClaimButtons = document.getElementsByClassName("claimRaceButton");
    for (let i = 0, l = raceClaimButtons.length; i < l; i++) {
        raceClaimButtons[i].onclick = function () {
            let race = raceClaimButtons[i].getAttribute('race');

            let request = new XMLHttpRequest();
            let raceIsFreeCheck = location.origin + '/racecheck/' + gameName + '/race/' + race + '/player/' + playerName;
            request.open('GET', raceIsFreeCheck, true);
            request.onload = function () {
                if (request.status === 200) {
                    if (JSON.parse(request.responseText).raceIsAvailable) {

                        let attackHeroButton = document.getElementById("hero-button-" + race + "-attack");
                        attackHeroButton.innerHTML = 'attack hero';
                        attackHeroButton.addEventListener('click', function () {
                            heroSelected(race, 'attack');
                        }, false);

                        let defenceHeroButton = document.getElementById("hero-button-" + race + "-defence");
                        defenceHeroButton.innerHTML = 'defence hero';
                        defenceHeroButton.addEventListener('click', function () {
                            heroSelected(race, 'defence');
                        }, false);

                        let businessHeroButton = document.getElementById("hero-button-" + race + "-business");
                        businessHeroButton.innerHTML = 'business hero';
                        businessHeroButton.addEventListener('click', function () {
                            heroSelected(race, 'business');
                        }, false);

                        document.getElementById('heroRaceSelector-' + race).style.display = "block";
                    } else {
                        alert('Some other player beat you too it, try another race');
                    }
                } else {
                    alert('The server or database is probably down, panic');
                }
            };
            request.send();
        };
    }
});



