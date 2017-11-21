document.addEventListener("DOMContentLoaded", function (event) {
    game_socket.on('displayActionModal', function (data) {
        console.log(`displayActionModal ${data}`);
        displayModal(data.message);
    });

    game_socket.on('enableMoves', function (data) {
        enableMoveActions(data, getPlayersRace());
    });

    game_socket.on('updateHarvestInformation', function (data) {
        updateHarvestInformation(data);
    });

    game_socket.on('removeHarvestTokens', function () {
        removeHarvestTokens();
    });

    game_socket.on('deploymentCommitPhase', function (playersDefaultDeployments) {
        deploymentCommitPhase(playersDefaultDeployments);
    });

    game_socket.on('deploymentDeployPhase', function (nextPlayer, deploymentInfo) {
        deployingUnits(nextPlayer, deploymentInfo);
    });

    game_socket.on('deploymentDeployPhaseOver', function () {
        hideAndResetDeploymentElements();
    });

    game_socket.on('refreshMapView', function () {
        GetMap(RenderMap, false);
    });

    game_socket.on('movementStepComplete', function (race) {
        movementStepComplete(race);
    });

    game_socket.on('updatePhaseInfo', function () {
        getGamePhase(gameRoom, updateRoundPhaseInfo);
    });

    GetMap(RenderMap, true);

    playerName = getPlayersName();
    console.log(`joinGame ${gameRoom} ${playerName}`);
    game_socket.emit('joinGame', {game_name: gameRoom, user: playerName});
    getGamePhase(gameRoom, updateRoundPhaseInfo);
});

var game_socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
var gameRoom = window.location.pathname.replace(/.*\//, '');
var playerName;
