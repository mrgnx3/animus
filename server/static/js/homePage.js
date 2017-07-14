document.addEventListener("DOMContentLoaded", function (event) {

    document.getElementById('clearCookieButton').onclick = function () {
        eraseCookie('animusUser');
        location.reload();
    };

    if (readCookie('animusUser')) {
        welcomeKnownUser();
    } else {
        document.getElementById('content').style.display = 'none';
        document.getElementById('userReg').style.display = 'block';

        document.getElementById('newUserButton').onclick = function () {

            var userName = document.getElementById('newUserTxtInput').value.replace(/^\s+|\s+$/g, "");
            debugger;
            if (userName === '') {
                alert("Please Enter a User Name");
            } else {
                createCookie('animusUser', userName, 10);
                welcomeKnownUser();
            }
        };
    }

    document.getElementById('createGameButton').onclick = function () {
        var gameName = document.getElementById('gameNameInput').value;
        createGameIfNameIsFree(gameName);
    };


    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('update_game_list', function () {
        getGamesToJoin();
    });

    socket.emit('enter_home_page');
});