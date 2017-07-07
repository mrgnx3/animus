/**
 * Created by ciaran.whyte on 7/6/17.
 */

function createGameIfNameIsFree(gameName) {
    var request = new XMLHttpRequest();
    var gameNameCheckUrl = location.origin + '/gamecheck/' + gameName;
    request.open('GET', gameNameCheckUrl, true);
    request.onload = function () {
        if (request.status === 200) {
            if (JSON.parse(request.responseText).gameNameIsAvailable) {
                var playerCount = document.getElementById('playerCountSelector').value;
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
    var request = new XMLHttpRequest();
    var createGameUrl = location.origin + '/createGame/' + gameName + '/playerCount/' + playerCount;
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

document.getElementById('createGameButton').onclick = function () {
    var gameName = document.getElementById('gameNameInput').value;
    createGameIfNameIsFree(gameName);
};