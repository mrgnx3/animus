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

        var userName = document.getElementById('newUserTxtInput').value.replace(/^\s*|\s*$/g, "");
        if (userName !== '') {
            alert("Please Enter a User Name");
        } else {
            createCookie('animusUser', userName, 10);
            welcomeKnownUser();
        }
    };
}


