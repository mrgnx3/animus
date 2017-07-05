function createCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

function createUser(userName) {
    var request = new XMLHttpRequest();
    var createUserUrl = location.origin + '/createUser/' + userName;
    request.open('GET', createUserUrl, true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            return JSON.parse(request.responseText);
        }
    };
    request.send();
}


document.getElementById('clearCookieButton').onclick = function () {
    eraseCookie('animusUser');
    location.reload();
};


function welcomeKnownUser() {
    document.getElementById('content').style.display = 'block';
    document.getElementById('clearCookieButton').style.display = 'block';
    document.getElementById('userReg').style.display = 'none';
    document.getElementById('welcomeText').textContent = readCookie('animusUser') + ', ' + document.getElementById('welcomeText').textContent;
}


if (readCookie('animusUser')) {
    welcomeKnownUser();
} else {
    document.getElementById('content').style.display = 'none';
    document.getElementById('userReg').style.display = 'block';

    document.getElementById('newUserButton').onclick = function () {

        userName = document.getElementById('newUserTxtInput').value.replace(/^\s*|\s*$/g, "");
        if (createUser(userName)) {
            alert("Please Enter a User Name");
        } else {
            createCookie('animusUser', userName, 10);
            welcomeKnownUser();
        }
    };
}


