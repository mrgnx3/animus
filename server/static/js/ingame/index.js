document.addEventListener("DOMContentLoaded", function (event) {
    game_socket.on('displayActionModal', function (data) {
        displayModal(data.message);
    });

    game_socket.on('updateHarvestInformation', function () {
        getHudStatistics(updateGameInfoHudStatistics);
        removeHarvestTokens();
    });

    game_socket.on('deploymentCommitPhase', function (playersDefaultDeployments) {
        deploymentCommitPhase(playersDefaultDeployments);
    });

    game_socket.on('proccessNextDeployment', function (deploymentInfo) {
        deployingUnits(deploymentInfo);
    });

    game_socket.on('deploymentDeployPhaseOver', function () {
        hideAndResetDeploymentElements();
    });

    game_socket.on('refreshMapView', function () {
        GetMap(RenderMap, false);
    });

    game_socket.on('clearTile', function (data) {
        clearTile(data.index, data.removeHightlightedOptions);
    });

    game_socket.on('refreshTiles', function (tilesToRefresh) {
        refreshTileList(tilesToRefresh);
    });

    game_socket.on('enableMoves', function (data) {
        enableMoveActions(data, getPlayersRace());
    });

    game_socket.on('activateMovementToken', function (data) {
        activateMoveToken(data);
    });

    game_socket.on('movementStepComplete', function (race) {
        movementStepComplete(race);
    });

    game_socket.on('updatePhaseInfo', function () {
        getGamePhase(gameRoom, updateRoundPhaseInfo);
    });

    GetMap(RenderMap, true);

    playerName = getPlayersName();
    game_socket.emit('joinGame', {game_name: gameRoom, user: playerName});
    getGamePhase(gameRoom, updateRoundPhaseInfo);
});

var game_socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
var gameRoom = window.location.pathname.replace(/.*\//, '');
var playerName;
