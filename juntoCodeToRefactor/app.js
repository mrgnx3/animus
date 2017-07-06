function lockInAction(element, icon, action, index) {
    var middleIcon = element.parentElement.getElementsByClassName('action-display')[0];
    middleIcon.classList.add(icon);
    middleIcon.classList.remove('fa-plus');

    var checkBox = element.parentElement.getElementsByClassName('menu-open')[0];
    checkBox.disabled = true;
    checkBox.checked = false;

    var menuOpenButton = element.parentElement.getElementsByClassName('menu-open-button')[0];
    menuOpenButton.style.background = "green";

    game_socket.emit('lockInOrder', action, playerName, gameRoom, index);

    if (document.getElementsByClassName('fa-plus').length == 0) game_socket.emit('allOrdersAreSet', gameRoom, playerName);
}

function removeOnClickEvent(element) {
    element.onclick = null;
    element.removeAttribute("onclick");
}

function calculateStrength(elements) {
    var strength = 0;
    for (var i = 0; i < elements.length; i++)
        strength += parseInt(elements[i].getElementsByTagName('text')[0].innerHTML);
    return strength;
}

function calculateSelectedStrength(elements) {
    var strength = 0;
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].childNodes[0].classList.contains("selected")) {
            strength += parseInt(elements[i].getElementsByTagName('text')[0].innerHTML);
        }
    }
    return strength;
}

function highlightMoveOptions(index, turnOn) {
    var allTileElements = document.getElementsByClassName('hex');
    var neighbouringTiles = index % 2 ? [-1, +1, -24, 23, 24, 25] : [-1, +1, -23, -24, -25, 24];

    for (var i = 0; i < neighbouringTiles.length; i++) {
        var hex = allTileElements[index + neighbouringTiles[i]];
        if (hex.className != "hex water") {
            turnOn ? hex.classList.add("highlight") : hex.classList.remove("highlight");
            if (turnOn) {
                hex.onclick = moveSelectUnits;
            } else {
                removeOnClickEvent(hex);
            }
        }
    }
}

function highlightDeploymentOptions(race, turnOn, infantry, ranged, tank) {
    let allTileElements = document.getElementsByClassName('hex');
    let allRaceEntries = document.getElementsByClassName(race);

    let raceTilesToCheckForHighLighting = [];
    //Convert collection of elements into array
    allRaceEntries = [].slice.call(allRaceEntries);
    allRaceEntries.forEach(function (entry) {
        let tile = entry.parentElement.parentElement;
        let tileIndex = getXValue(tile) + (getYValue(tile) * 24);
        if (raceTilesToCheckForHighLighting.indexOf(tileIndex) == -1) {
            raceTilesToCheckForHighLighting.push(tileIndex);
        }
    });

    raceTilesToCheckForHighLighting.forEach(function (index) {
        let neighbouringTiles = index % 2 ? [0, -1, +1, -24, 23, 24, 25] : [0, -1, +1, -23, -24, -25, 24];
        for (let i = 0; i < neighbouringTiles.length; i++) {
            let neighbouringTilesIndex = index + neighbouringTiles[i];
            let hex = allTileElements[neighbouringTilesIndex];

            let neutralTile = true;
            if (hex.childNodes[0].childElementCount > 0) {
                neutralTile = hex.childNodes[0].childNodes[0].childNodes[0].classList.contains(race);
            }

            if (hex.className != "hex water" && neutralTile) {
                if (turnOn) {
                    hex.classList.add("highlight");
                    hex.onclick = function () {
                        deployUnitsToTile(allTileElements, neighbouringTilesIndex, infantry, ranged, tank);
                        highlightDeploymentOptions(race, false);
                    };
                } else {
                    hex.classList.remove("highlight");
                    removeOnClickEvent(hex);
                }
            }
        }
    });
}

function deployUnitsToTile(hexes, index, infantry, ranged, tanks) {
    let targetHex = hexes[index];
    let deploymentValues = {
        "infantry": infantry,
        "ranged": ranged,
        "tanks": tanks
    };

    if (targetHex.childNodes[0].childElementCount != 0) {
        // targetHex has existing units which need updating
        for (let i = 0; i < targetHex.childNodes[0].childElementCount; i++) {
            let unitsClassList = targetHex.childNodes[0].childNodes[i].childNodes[0].classList;
            let unitsTextElement = targetHex.childNodes[0].childNodes[i].childNodes[1];
            let unitValue = parseInt(unitsTextElement.textContent);

            if (unitsClassList.contains("infantry")) {
                infantry += unitValue;
            } else if (unitsClassList.contains("ranged")) {
                ranged += unitValue;
            } else {
                tanks += unitValue;
            }
        }
    }

    let race = getPlayersRace();
    targetHex.innerHTML = getSvgForUnits(race, infantry, ranged, tanks);
    game_socket.emit('deploymentOfUnits', gameRoom, index, race, infantry, ranged, tanks, deploymentValues);
    //todo Update the deployment tab and check if deployment is complete
}

function handleMoveAction(index, movementAction, turnOn) {
    highlightMoveOptions(index, turnOn);
    movementAction.parentElement.parentElement.childNodes[0].disbled = turnOn;

    var unitList = movementAction.parentElement.parentElement.getElementsByTagName('g');
    for (var i = 0; i < unitList.length; i++) {
        var svgElement = unitList[i];
        if (turnOn) {
            svgElement.onclick = markAsSelected;
        } else {
            removeOnClickEvent(svgElement);
        }
    }

    function markAsSelected() {
        this.childNodes[0].classList.add("selected");
    }
}

function enableMoveActions(userToEnableMovesFor, playerName) {

    if (userToEnableMovesFor == playerName) {
        var listOfMoves = document.getElementsByClassName('action-display fa-arrow-right');
        for (var i = 0; i < listOfMoves.length; i++) {
            var movementAction = listOfMoves[i];
            movementAction.parentElement.style.background = 'orange';
            movementAction.parentElement.onclick = function () {

                //Mark as active
                var activeTileInputTag = this.parentElement.getElementsByTagName('input')[0];
                var index = parseInt(activeTileInputTag.attributes.name.value.replace("menu-open", ""));
                this.classList.add('ACTIVE');

                // Reset other tiles
                for (var i = 0; i < listOfMoves.length; i++) {
                    var notSelected = !listOfMoves[i].parentElement.classList.contains('ACTIVE');
                    if (notSelected) {
                        listOfMoves[i].parentElement.style.background = 'green';
                        removeOnClickEvent(listOfMoves[i].parentElement);
                    }
                }
                //Handle move
                handleMoveAction(index, this, true);

                //End move with second click
                this.onclick = function () {
                    handleMoveAction(index, this, false);
                    removeActionMenu(this.parentElement);
                }
            };
        }
    } else {
        displayModal("<h1>Hold onto your butts</h1><p>Its " + userToEnableMovesFor + " turn</p>");
    }
}

function moveSelectUnits() {
    var selectedUnitsShapesToMove = getSelectedUnitsShapesToMove();
    var targetTile = this.childNodes;

    if (isBattleMovement(targetTile, selectedUnitsShapesToMove)) {
        resolveBattleMovement(targetTile, selectedUnitsShapesToMove);
    } else {
        resolvePeacefulMovement(targetTile, selectedUnitsShapesToMove);
    }
}

function getSelectedUnitsShapesToMove() {
    return document.getElementsByClassName('ACTIVE')[0]
        .parentElement
        .parentElement
        .childNodes[1]
        .getElementsByClassName('selected');
}

function getParentsFor(elements) {
    var arrayOfParents = [];
    for (var i = 0; i < elements.length; i++) {
        arrayOfParents.push(elements[i].parentElement);
    }
    return arrayOfParents;
}

function resolveBattleMovement(targetTile, selectedUnitsShapesToMove) {

    var attackingUnitsSvgElement = selectedUnitsShapesToMove[0].parentElement.parentElement;
    var defendingUnitsSvgElement = targetTile[0].parentElement.getElementsByTagName('svg')[0];

    var arrayOfAttackingUnits = getParentsFor(selectedUnitsShapesToMove);
    var arrayOfDefendingUnits = defendingUnitsSvgElement.getElementsByTagName('g');

    var defStr = calculateStrength(arrayOfDefendingUnits);
    var atkStr = calculateSelectedStrength(attackingUnitsSvgElement.childNodes);

    if (defStr > atkStr) {
        defenderWins(arrayOfAttackingUnits, attackingUnitsSvgElement, arrayOfDefendingUnits, defendingUnitsSvgElement, atkStr);
    } else if (defStr < atkStr) {
        attackerWins(arrayOfDefendingUnits, defendingUnitsSvgElement, arrayOfAttackingUnits, attackingUnitsSvgElement, defStr);
    } else {
        itsADraw(arrayOfAttackingUnits, attackingUnitsSvgElement, arrayOfDefendingUnits, defendingUnitsSvgElement);
    }
}

function itsADraw(arrayOfAttackingUnits, attackingUnitsSvgElement, arrayOfDefendingUnits, defendingUnitsSvgElement) {
    killUnits(arrayOfAttackingUnits, attackingUnitsSvgElement, true, 0);
    killUnits(arrayOfDefendingUnits, defendingUnitsSvgElement, true, 0);
    if (noUnitsRemaining(defendingUnitsSvgElement)) {
        removeActionMenu(defendingUnitsSvgElement.parentElement.childNodes[0]);
    }
    if (noUnitsRemaining(attackingUnitsSvgElement)) {
        removeActionMenu(attackingUnitsSvgElement.parentElement.childNodes[0]);
    }
}

function attackerWins(arrayOfDefendingUnits, defendingUnitsSvgElement, arrayOfAttackingUnits, attackingUnitsSvgElement, defStr) {
    var attackersIndex = getIndexValue(arrayOfAttackingUnits[0].parentElement);
    var defendersIndex = getIndexValue(arrayOfDefendingUnits[0].parentElement);

    var attackersSelectedUnits = attackingUnitsSvgElement.getElementsByClassName('selected');
    var attackingWith = {
        infantry: 0, ranged: 0, tanks: 0
    };
    for (var i = 0; i < attackersSelectedUnits.length; i++) {
        attackingWith[attackersSelectedUnits[i].classList[1]] = parseInt(attackersSelectedUnits[i].parentElement.childNodes[1].textContent)
    }

    game_socket.emit('resolveBattle', gameRoom, playerName, attackersIndex, defendersIndex, attackingWith);
}

function defenderWins(arrayOfAttackingUnits, attackingUnitsSvgElement, arrayOfDefendingUnits, defendingUnitsSvgElement, atkStr) {
    killUnits(arrayOfAttackingUnits, attackingUnitsSvgElement, true, 0);
    killUnits(arrayOfDefendingUnits, defendingUnitsSvgElement, false, atkStr);
    if (noUnitsRemaining(attackingUnitsSvgElement)) {
        removeActionMenu(attackingUnitsSvgElement.parentElement.childNodes[0]);
    }
}

function noUnitsRemaining(svgElement) {
    return svgElement.childElementCount == 0 && svgElement.parentElement.childElementCount == 2;
}

function deleteChild(parentTile, unitsToKill) {
    parentTile.removeChild(unitsToKill[0]);
    //todo: investigate this tryCatch further, removeChild seems to update the last
    //todo: iteration of removing a element from unitsToKill, i've tried
    //todo: wrapping this in a if check for unitsToKill.length but its
    //todo: saying there is an element to be updated and splice is reporting
    //todo: otherwise
    try {
        unitsToKill.splice(0, 1);
    } catch (e) {
        console.log("Error Caught: " + e);
    }
}

function killUnits(unitsToKill, parentTile, killAll, damageTaken) {
    var tilesIndex = getIndexValue(unitsToKill[0].parentElement);
    if (killAll) {
        game_socket.emit('removeAllUnitsInTile', gameRoom, tilesIndex);
        while (unitsToKill.length > 0) {
            deleteChild(parentTile, unitsToKill);
        }
    } else {
        var valueOfUnitsKilled = 0;
        while (damageTaken > valueOfUnitsKilled) {
            var currentUnitValue = parseInt(unitsToKill[0].getElementsByTagName('text')[0].innerHTML) - 1;
            game_socket.emit('minusOneFromUnitValue', gameRoom, tilesIndex, getUnitType(unitsToKill[0]));
            if (currentUnitValue == 0) {
                deleteChild(parentTile, unitsToKill);
            } else {
                unitsToKill[0].getElementsByTagName('text')[0].innerHTML = currentUnitValue;
            }
            valueOfUnitsKilled++;
        }
    }
    return unitsToKill;
}

function isBattleMovement(targetTile, selectedUnitsShapesToMove) {
    if (selectedUnitsShapesToMove.length == 0) {
        return false;
    } else if (tileHasUnits(targetTile)) {
        return (getRaceOfUnit(selectedUnitsShapesToMove) != getUnitsRaceInTargetTile(targetTile));
    }
    return false;
}

function getUnitsRaceInTargetTile(targetTile) {
    return targetTile[0].parentElement.getElementsByTagName('g')[0].childNodes[0].classList[0];
}

function getRaceOfUnit(selectedUnitsShapesToMove) {
    return selectedUnitsShapesToMove[0].classList[0];
}

function resolvePeacefulMovement(targetTile, selectedUnitsShapesToMove) {
    function moveUnit(selectedUnitsShapesToMove) {
        if (selectedUnitsShapesToMove.length == 0) return;

        var shapeToMove = selectedUnitsShapesToMove[0];
        removeSelectedState(shapeToMove);

        if (tileHasUnits(targetTile)) {
            if (unitMergeRequired(targetTile, shapeToMove)) {
                console.log("mergeUnits " + shapeToMove.toString);
                mergeUnits(shapeToMove, targetTile, waitForUpdateAndLoopIfNeeded);
            } else {
                console.log("moveToNonHostileTarget " + shapeToMove.toString);
                moveToNonHostileTarget(targetTile, shapeToMove.parentElement, waitForUpdateAndLoopIfNeeded);
            }
        } else {
            console.log("no tileHasUnits -  moveToNonHostileTarget " + shapeToMove.toString);
            moveToNonHostileTarget(targetTile, shapeToMove.parentElement, waitForUpdateAndLoopIfNeeded);
        }
    }

    function waitForUpdateAndLoopIfNeeded() {
        if (selectedUnitsShapesToMove.length > 0) moveUnit(selectedUnitsShapesToMove);
    }

    moveUnit(selectedUnitsShapesToMove);
}

function moveToNonHostileTarget(target, unit, cb) {
    var originTile = unit.parentElement;

    var movementDetails = {
        gameRoom: gameRoom,
        originIndex: getIndexValue(originTile),
        targetIndex: getIndexValue(target[0]),
        unitType: getUnitType(unit),
        unitValue: getUnitValue(unit),
        unitRace: getUnitRace(unit)
    };

    game_socket.emit('peacefulMove', movementDetails, cb);

    target[0].parentElement.getElementsByTagName('svg')[0].appendChild(unit);
    if (originTile.childElementCount == 0) {
        removeActionMenu(originTile.parentElement.childNodes[0]);
    }
}

function removeActionMenu(menu) {
    var activeMenu = menu.getElementsByTagName('label')[0].classList.contains('ACTIVE');
    debugger;
    var index = parseInt(menu.getElementsByTagName('input')[0].name.replace("menu-open", ""));
    menu.parentElement.removeChild(menu);
    game_socket.emit('lockInOrder', "done", playerName, gameRoom, index);
    if (activeMenu) {
        highlightMoveOptions(index, false);
        game_socket.emit('refreshUsersInGame', gameRoom);
        setTimeout(function () {
            game_socket.emit('moveOrderComplete', gameRoom, playerName);
        }, 1000);
    }
}

function removeSelectedState(shapeToMove) {
    shapeToMove.classList.remove('selected');
    removeOnClickEvent(shapeToMove.parentElement);
}

function mergeUnits(shapeToMove, targetTile, cb) {
    var svgElement = shapeToMove.parentElement.parentElement;

    var newForces = parseInt(shapeToMove.parentElement
        .getElementsByTagName('text')[0]
        .innerHTML);

    var existingForces = parseInt(targetTile[0].parentElement
        .getElementsByTagName(shapeToMove.tagName)[0]
        .parentElement
        .getElementsByTagName('text')[0]
        .innerHTML);

    targetTile[0].parentElement
        .getElementsByTagName(shapeToMove.tagName)[0]
        .parentElement
        .getElementsByTagName('text')[0]
        .innerHTML = newForces + existingForces;

    var movementDetails = {
        gameRoom: gameRoom,
        originIndex: getIndexValue(svgElement),
        targetIndex: getIndexValue(targetTile[0]),
        unitType: getUnitType(shapeToMove.parentElement),
        unitValue: getUnitValue(shapeToMove.parentElement),
        unitRace: getUnitRace(shapeToMove.parentElement)
    };

    game_socket.emit('peacefulMerge', movementDetails, cb);

    var anyUnitsLeft = svgElement.childElementCount - 1;
    svgElement.removeChild(shapeToMove.parentElement);

    if (anyUnitsLeft == 0) {
        removeActionMenu(svgElement.parentElement.childNodes[0]);
    }
}

function unitMergeRequired(tile, shapeToMove) {
    return (tile[0].parentElement.getElementsByTagName(shapeToMove.tagName).length == 1);
}

function tileHasUnits(tileElement) {
    return (tileElement[0].parentElement.getElementsByTagName('g').length > 0);
}

function removeHarvestTokens() {
    displayModal("<h2>The harvest has come!</h2><h3>Time to deploy</h3>");
    var diamonds = document.getElementsByClassName("fa-diamond rotate");
    for (var i = 0; i < diamonds.length; i++) {
        var tile = diamonds[i].parentElement.parentElement.parentElement;
        var harvestOrderToken = tile.childNodes[0];
        tile.removeChild(harvestOrderToken);
    }
}

function deploymentCommitPhase(playersDefaultDeployments) {
    hideModal();
    displayDeploymentCommitTab(playersDefaultDeployments);
}

function deployingUnits(nextPlayer, deploymentInfo) {
    if (nextPlayer === playerName) {
        displayDeploymentDeployTab(deploymentInfo);
    } else {
        displayModal("<h3>Waiting for " + nextPlayer + " to make their deployment</h3>");
        document.getElementById('game_hud_deployment_deploy_tab').style.display = 'none';
        if (document.getElementById('game_hud_deploy_deploy').classList.contains('activeHud')) {
            document.getElementById('game_hud_deploy_deploy').classList.remove('activeHud');
            document.getElementById('game_hud_deploy_deploy').classList.add('hudContainer');
            changedHUDView('game_hud', true);
        }
    }
}

function battleResolved(user) {
    if (user === playerName) {
        var activeSvgElement = document.getElementsByClassName("menu-open-button ACTIVE")[0]
            .parentElement.parentElement.childNodes[1];

        if (noUnitsRemaining(activeSvgElement)) {
            removeActionMenu(document.getElementsByClassName("menu-open-button ACTIVE")[0].parentElement);
        } else {
            GetMapUnits(24, function (col, units) {
                var targetIndex = getIndexValue(activeSvgElement);
                var neighbouringTiles = targetIndex % 2 ? [-1, +1, -24, 23, 24, 25] : [-1, +1, -23, -24, -25, 24];
                updateTilesAfterBattleMovement(col, units, targetIndex, neighbouringTiles);
            });
        }
    }
}

function updateHarvestInformation(data) {
    //todo make this dynamic
    document.getElementById('kingdomWatchers-harvest-count').innerHTML = String(data.kingdomWatchers.currentAmount);
    document.getElementById('kingdomWatchers-harvest-rate').innerHTML = 'x' + String(data.kingdomWatchers.collectionRate);
    document.getElementById('periplaneta-harvest-count').innerHTML = String(data.periplaneta.currentAmount);
    document.getElementById('periplaneta-harvest-rate').innerHTML = 'x' + String(data.periplaneta.collectionRate);

    document.getElementById("geoEngineers-harvest").style.display = "none";
    document.getElementById("settlers-harvest").style.display = "none";
    document.getElementById("reduviidae-harvest").style.display = "none";
    document.getElementById("guardians-harvest").style.display = "none";

    //update deployment hub view at the same time
    var playersRace = getPlayersRace();
    document.getElementById('harvest-value').innerHTML = String(data[playersRace].currentAmount);
}

function updateRoundPhaseInfo(data) {
    document.getElementById('round-value').textContent = "#" + data.round;
    document.getElementById('phase-value').textContent = data.phase.name;
    if(data.activePlayer.length < 1){
        document.getElementById('waiting-on-value').textContent = "All Players  ";
    } else {
        document.getElementById('waiting-on-value').textContent = data.activePlayer;
    }
}

function displayModal(modalBody, requiredInfo) {
    //todo: fix this
    var races = ["kingdomWatchers", "periplaneta"];

    if (races.indexOf(modalBody) > -1) {
        getRequiredInfo(modalBody, requiredInfo, function (data) {
            populateModal(data);
        });
    } else {
        populateModal(modalBody);
    }
    function populateModal(gameModalBody) {
        document.getElementById('gameModalBody').innerHTML = gameModalBody;
        document.getElementById('gameModal').classList.add('show');
        document.getElementById('gameModal').onclick = function () {
            document.getElementById('gameModal').classList.remove('show');
        };
    }
}

function hideModal() {
    var gameModal = document.getElementById('gameModal');
    if (gameModal.classList.contains('show')) {
        gameModal.classList.remove('show');
    }
}

function getRequiredInfo(modalBody, requiredInfo, cb) {
    function loadJSON(callback) {
        var url;
        if (requiredInfo == "history") {
            url = '/getRaceHistory/' + modalBody;
        } else if (requiredInfo == "leaderBio") {
            //leader hardcoded for now
            //TODO create controller for leader retrieval
            url = '/getLeaderBio/' + modalBody + '/leader_1';
        }

        var http = new XMLHttpRequest();
        http.overrideMimeType("application/json");
        http.open('GET', location.origin + url, true);
        http.onload = function () {
            if (http.readyState == 4 && http.status == "200") {
                callback(http.responseText);
            }
        };
        http.send();
    }

    loadJSON(function (response) {
        cb(JSON.parse(response));
    });
}

function getXValue(element) {
    return parseInt(element.parentElement.id.replace("x_", ""));
}

function getYValue(element) {
    return parseInt(element.parentElement.parentElement.id.replace("y_", ""));
}

function getIndexValue(element) {
    return getXValue(element) + (getYValue(element) * 24);
}

function getUnitType(element) {
    return element.childNodes[0].classList[1];
}

function getUnitRace(element) {
    return element.childNodes[0].classList[0];
}

function getUnitValue(element) {
    return parseInt(element.childNodes[1].textContent);
}