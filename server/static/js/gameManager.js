/**
 * Created by ciaran.whyte on 7/6/17.
 */

function gameExists(gameName) {
    var request = new XMLHttpRequest();
    var gameNameCheckUrl = location.origin + '/gamecheck/' + gameName;
    request.open('GET', gameNameCheckUrl, true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            return JSON.parse(request.responseText);
        }
    };
    request.send();
}


document.getElementById('createGameButton').onclick = function () {
  var gameName = document.getElementById('gameNameInput').value;
  var playerCount = document.getElementById('playerCountSelector').value;

  if(gameExists(gameName)){
      alert('GameName in use');
  } else {

  }

};