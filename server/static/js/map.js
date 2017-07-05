function GetMap(callback, flag) {
    var request = new XMLHttpRequest();
    var getBaseBoardUrl = location.origin + '/getBaseBoard';
    request.open('GET', getBaseBoardUrl, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            callback(JSON.parse(request.responseText)[0].map, flag);
        }
    };
    request.send();
}

function getGamePhase(room, callback) {
    var request = new XMLHttpRequest();
    var getPhaseUrl = location.origin + '/getGamesRoundPhaseInfo/' + room;
    request.open('GET', getPhaseUrl, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            callback(JSON.parse(request.responseText));
        }
    };
    request.send();
}

function getRaceByPlayerName(playerName, gameName, callback) {
    var request = new XMLHttpRequest();
    var getPlayersRaceUrl = location.origin + '/getPlayersRace/' + playerName + "/" + gameName;
    request.open('GET', getPlayersRaceUrl, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            callback(JSON.parse(request.responseText).race);
        }
    };
    request.send();
}

function GetMapUnits(cols, callback) {
    var request = new XMLHttpRequest();
    var getMapUnitsUrl = location.origin + '/getMapUnits/' + window.location.pathname.replace(/.*\//, '');
    request.open('GET', getMapUnitsUrl, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            callback(cols, JSON.parse(request.responseText));
        }
    };
    request.send();
}

function getPlayersName() {
    return document.getElementById('playerName').attributes[1].value;
}

function getPlayersRace() {
    return document.getElementById('playerRace').attributes[1].value;
}

function drawAllUnits(cols, units) {
    var playerName = getPlayersName();
    var gameName = getGameName();
    getRaceByPlayerName(playerName, gameName, function (race) {
        for (var i = 0; i < units.length; i++) {
            drawUnits(race, cols, units[i]);
        }
        initSocketSession();
    });

}

function updateTilesAfterBattleMovement(cols, units, targetIndex, neighbouringTiles) {
    var race = getPlayersRace();

    var unitsLeftInTargetIndex = false;
    for (var tileIndex = 0; tileIndex < units.length; tileIndex++) {
        drawUnits(race, cols, units[tileIndex]);

        if( targetIndex == units[tileIndex]["index"]){
            unitsLeftInTargetIndex = true;
        }
    }

    var activeTileInputTag = document.getElementsByClassName('hex')[targetIndex].getElementsByTagName('input')[0];
    if(unitsLeftInTargetIndex){
        activeTileInputTag.parentElement.childNodes[1].classList.add('ACTIVE');
        activeTileInputTag.parentElement.childNodes[1].style.backgroundColor = "orange";

        //Handle move
        handleMoveAction(targetIndex, activeTileInputTag, true);

        //End move with second click
        activeTileInputTag.onclick = function () {
            handleMoveAction(targetIndex, activeTileInputTag, false);
            removeActionMenu(activeTileInputTag.parentElement);
        }
    } else {
        handleMoveAction(targetIndex, activeTileInputTag, false);
        removeActionMenu(activeTileInputTag.parentElement);
    }
}

function getGameName() {
    return window.location.pathname.replace(/.*\//, '');
}

function GetHudStatistics(callback) {

    var gameName = getGameName();
    var playerName = getPlayersName();
    getRaceByPlayerName(playerName, gameName, sendRequest);

    function sendRequest(race) {
        var request = new XMLHttpRequest();
        request.open('GET', location.origin + '/getHudStatistics/' + gameName + '/' + race, true);
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                callback(JSON.parse(request.responseText));
            }
        };
        request.send();
    }
}

function getMenu(index, order, isActivePlayersMenu) {
    switch (order) {
        case "notSet":
            return notSetMenu(index, isActivePlayersMenu);
        case "move":
            return presetMoveOrder(index, isActivePlayersMenu);
        case "defense":
            return presetDefenceOrder(index, isActivePlayersMenu);
        case "recruit":
            return presetRecruitOrder(index, isActivePlayersMenu);
        case "harvest":
            return presetHarvestOrder(index, isActivePlayersMenu);
        default:
            return "";
    }
}

function notSetMenu(index, isActivePlayersMenu) {
    if (isActivePlayersMenu) {
        return [
            '<nav class="menu" >',
            '<input type="checkbox" href="#" class="menu-open" name="menu-open' + index + '" id="menu-open' + index + '"/>',
            '<label class="menu-open-button" for="menu-open' + index + '" id="order">',
            '<i class="fa fa-plus rotate action-display" ></i>',
            '</label>',
            '<a href="#" class="menu-item" onclick="lockInAction(this,\'fa-arrow-right\',\'move\',' + index + ')"> <i class="fa fa-arrow-right move-action"></i> </a>',
            '<a href="#" class="menu-item" onclick="lockInAction(this,\'fa-shield\',\'defence\',' + index + ')"> <i class="fa fa-shield defence-action"></i> </a>',
            '<a href="#" class="menu-item" onclick="lockInAction(this,\'fa-bug\',\'recruit\',' + index + ')"> <i class="fa fa-bug recruit-action"></i> </a>',
            '<a href="#" class="menu-item" onclick="lockInAction(this,\'fa-diamond\',\'harvest\',' + index + ')"> <i class="fa fa-diamond harvest-action"></i> </a>',
            '</nav>'
        ].join("");
    } else {
        return [
            '<nav class="disabled-menu" >',
            '<label class="disabled-menu-open-button" for="disabled-menu-open' + index + '" id="order">',
            '<i class="fa fa-question"></i>',
            '</label>',
            '</nav>'
        ].join("");
    }
}

function presetDefenceOrder(index, isActivePlayersMenu) {
    if (isActivePlayersMenu) {
        return [
            '<nav class="menu" >',
            '<input type="checkbox" href="#" class="menu-open" name="menu-open' + index + '" id="menu-open' + index + '"/>',
            '<label class="menu-open-button" for="menu-open' + index + '" id="order" style="background: green">',
            '<i class="fa fa-shield rotate action-display" ></i>',
            '</label>',
            '</nav>'
        ].join("");
    } else {
        return [
            '<nav class="disabled-menu" >',
            '<label class="disabled-menu-open-button" for="disabled-menu-open' + index + '" id="order">',
            '<i class="fa fa-shield"></i>',
            '</label>',
            '</nav>'
        ].join("");
    }
}

function presetRecruitOrder(index, isActivePlayersMenu) {
    if (isActivePlayersMenu) {
        return [
            '<nav class="menu" >',
            '<input type="checkbox" href="#" class="menu-open" name="menu-open' + index + '" id="menu-open' + index + '"/>',
            '<label class="menu-open-button" for="menu-open' + index + '" id="order" style="background: green">',
            '<i class="fa fa-bug rotate action-display" ></i>',
            '</label>',
            '</nav>'
        ].join("");
    } else {
        return [
            '<nav class="disabled-menu" >',
            '<label class="disabled-menu-open-button" for="disabled-menu-open' + index + '" id="order">',
            '<i class="fa fa-bug"></i>',
            '</label>',
            '</nav>'
        ].join("");
    }
}

function presetHarvestOrder(index, isActivePlayersMenu) {
    if (isActivePlayersMenu) {
        return [
            '<nav class="menu" >',
            '<input type="checkbox" href="#" class="menu-open" name="menu-open' + index + '" id="menu-open' + index + '"/>',
            '<label class="menu-open-button" for="menu-open' + index + '" id="order" style="background: green">',
            '<i class="fa fa-diamond rotate action-display" ></i>',
            '</label>',
            '</nav>'
        ].join("");
    } else {
        return [
            '<nav class="disabled-menu" >',
            '<label class="disabled-menu-open-button" for="disabled-menu-open' + index + '" id="order">',
            '<i class="fa fa-diamond rotate"></i>',
            '</label>',
            '</nav>'
        ].join("");
    }
}

function presetMoveOrder(index, isActivePlayersMenu) {
    if (isActivePlayersMenu) {
        return [
            '<nav class="menu" >',
            '<input type="checkbox" href="#" class="menu-open" name="menu-open' + index + '" id="menu-open' + index + '"/>',
            '<label class="menu-open-button" for="menu-open' + index + '" id="order" style="background: green">',
            '<i class="fa fa-arrow-right rotate action-display" ></i>',
            '</label>',
            '</nav>'
        ].join("");
    } else {
        return [
            '<nav class="disabled-menu" >',
            '<label class="disabled-menu-open-button" for="disabled-menu-open' + index + '" id="order">',
            '<i class="fa fa-arrow-right"></i>',
            '</label>',
            '</nav>'
        ].join("");
    }
}

function displayInfantryUnits(race, numberOfUnits) {
    if (numberOfUnits == 0) {
        return "";
    } else {
        var infantrySvgOpen = '<g><circle cx="30" cy="60" r="15" class="';
        var infantrySvgClose = ' infantry"></circle><text x="25" y="65" font-family="Verdana" font-size="20" fill="black">' + numberOfUnits + '</text></g>';
        return [infantrySvgOpen, race, infantrySvgClose].join('');
    }
}

function displayRangedUnits(race, numberOfUnits) {
    if (numberOfUnits == 0) {
        return "";
    } else {
        var rangedSvgOpen = '<g><polygon points="60,5 40,40 80,40" class="';
        var rangedSvgClose = ' ranged"/><text x="55" y="35" font-family="Verdana" font-size="20" fill="black">' + numberOfUnits + '</text></g>';
        return [rangedSvgOpen, race, rangedSvgClose].join('');
    }
}

function displayTankUnits(race, numberOfUnits) {
    if (numberOfUnits == 0) {
        return "";
    } else {
        var svgOpen = '<g><rect x="50" y="50" width="40" height="40" class="';
        var svgClose = ' tanks" /><text x="60" y="75" font-family="Verdana" font-size="20" fill="black">' + numberOfUnits + '</text> </g>';
        return [svgOpen, race, svgClose].join('');
    }
}

function getSvgForUnits(faction, infantry, ranged, tank) {
    return ['<svg height="100" width="100">',
        displayInfantryUnits(faction, infantry),
        displayRangedUnits(faction, ranged),
        displayTankUnits(faction, tank),
        '</svg>'].join("");
}

function drawUnits(race, cols, unitSet) {
    var hexes = document.getElementsByClassName('hex');
    for (var i = 0; i < hexes.length; i++) {
        if (((unitSet.posY * cols) + unitSet.posX) == i) {
            if (race == unitSet.race) {
                hexes[i].innerHTML = getMenu(i, unitSet.order, true) + getSvgForUnits(unitSet.race, unitSet.infantry, unitSet.ranged, unitSet.tanks);
            } else {
                hexes[i].innerHTML = getMenu(i, unitSet.order, false) + getSvgForUnits(unitSet.race, unitSet.infantry, unitSet.ranged, unitSet.tanks);
            }
        }
    }
}

function RenderMap(boardBackgroundMap, isFirstInitializationOfMap) {

    if (isFirstInitializationOfMap) {
        document.getElementsByTagName('body')[0].innerHTML += '<div id="map"></div>';
    }

    // Board element.
    var map = document.getElementById('map');

    // Board size.
    var rows = boardBackgroundMap.length;
    var cols = boardBackgroundMap[0].length;

    //Inner, scrollable map container.
    if (isFirstInitializationOfMap) {
        map.innerHTML += '<div id="mapHolder" style="width: ' + (cols * 94) + 'px"></div>';
    } else {
        map.innerHTML = '<div id="mapHolder" style="width: ' + (cols * 94) + 'px"></div>';
    }
    var mapHolder = document.getElementById('mapHolder');

    // Generate a row of hexes as html.
    var rowHtml = "";
    for (var i = 0; i < cols; i++)
        rowHtml += '<div class="hex" id="x_' + i + '"><svg height="100" width="100"></svg></div>';
    rowHtml += "</div>";

    // Main map html.
    var mapHtml = "";
    for (i = 0; i < rows; i++)
        mapHtml += ('<div id="y_' + i + '">' + rowHtml);

    // Set map contents.
    mapHolder.innerHTML = mapHtml;

// Generate hex terrain.
    var rowCounter = 0;
    var y = 0;

    var hexes = document.getElementsByClassName('hex');
    for (var i = 0; i < hexes.length; i++) {
        var x = i % cols;
        if (rowCounter == cols) {
            y = y + 1;
            rowCounter = 0;
        }
        rowCounter++;

        if (boardBackgroundMap[y][x] == 0)
            hexes[i].className += " water";
        else if (boardBackgroundMap[y][x] == 1)
            hexes[i].className += " grass";
        else if (boardBackgroundMap[y][x] == 2)
            hexes[i].className += " forest";
        else
            hexes[i].className += " desert";
    }
    GetMapUnits(cols, drawAllUnits);
    addHudListeners();
}

