/**
 * Created by ciaran.whyte on 7/6/17.
 */

function createGameIfNameIsFree(gameName) {
    let request = new XMLHttpRequest();
    let gameNameCheckUrl = location.origin + '/gamecheck/' + gameName;
    request.open('GET', gameNameCheckUrl, true);
    request.onload = function () {
        if (request.status === 200) {
            if (JSON.parse(request.responseText).gameNameIsAvailable) {
                let playerCount = document.getElementById('playerCountSelector').value;
                createGame(gameName, playerCount);
            } else {
                alert('Game name is already in use, try another');
            }
        } else {
            alert('The server or database is probably down');
        }
    };
    request.send();
}

function createGame(gameName, playerCount) {
    let request = new XMLHttpRequest();
    let createGameUrl = location.origin + '/createGame/' + gameName + '/playerCount/' + playerCount;
    request.open('GET', createGameUrl, true);
    request.onload = function () {
        if (request.status === 200) {
            window.location.href = location.origin + '/lobby/' + gameName;
        } else {
            alert('Something went wrong, try doing it right');
        }
    };
    request.send();
}

function joinLobby(gameName){
    window.location = location.origin + '/lobby/' + gameName;
}

function refreshGamesToJoinTable(gameList) {

    let tableHtml = '<tr><th colspan="2" class="tg">Games Ready To Join</th></tr>';

    for (let i = 0, l = gameList.length; i < l; i++) {
        tableHtml += '<tr><td class="tg">' + gameList[i] + '</td><td class="tg"><a id="' + gameList[i] + '" onclick="joinLobby(\'' + gameList[i] + '\')" class="joinGameButton">Join Game</a></td></tr>';
    }

    document.getElementById('gamesToJoinTable').innerHTML = tableHtml;
}

function getGamesToJoin() {
    console.log("refreshing games to join list");
    let request = new XMLHttpRequest();
    let gameNameCheckUrl = location.origin.replace("#", "") + '/gamesToJoin/';
    request.open('GET', gameNameCheckUrl, true);
    request.onload = function () {
        refreshGamesToJoinTable(JSON.parse(request.responseText).gameList)
    };
    request.send();
}
