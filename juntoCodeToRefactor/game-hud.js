function changedHUDView(idName, changeViewTo) {

    function DisplayHud() {
        var hudDisplay = document.getElementById(idName);

        if (hudDisplay.classList.contains('activeHud')) {
            hudDisplay.classList.remove('activeHud');
            hudDisplay.classList.add('hudContainer');
        } else {
            var activeHud = document.getElementsByClassName('activeHud')[0];
            if (activeHud) {
                activeHud.classList.remove('activeHud');
                activeHud.classList.add('hudContainer');
            }
            hudDisplay.classList.remove('hudContainer');
            hudDisplay.classList.add('activeHud');
        }
    }

    function makeHudActiveIfNotAlready(idName) {
        var hudDisplay = document.getElementById(idName);

        if (!hudDisplay.classList.contains('activeHud')) {
            var activeHud = document.getElementsByClassName('activeHud')[0];
            if (activeHud) {
                activeHud.classList.remove('activeHud');
                activeHud.classList.add('hudContainer');
            }
            hudDisplay.classList.remove('hudContainer');
            hudDisplay.classList.add('activeHud');
        }
    }

    if (changeViewTo) {
        makeHudActiveIfNotAlready(idName);
    } else {
        GetHudStatistics(DisplayHud);
    }
}

function updateUnitsStrength(data) {
    document.getElementById('tank_units_hud').innerHTML = data.tank;
    document.getElementById('infantry_units_hud').innerHTML = data.infantry;
    document.getElementById('ranged_units_hud').innerHTML = data.ranged;
}

function addHudListeners() {
    document.getElementById('game_hud_tab').onclick = function () {
        changedHUDView('game_hud');
    };
    document.getElementById('game_hud_deployment_commit_tab').onclick = function () {
        changedHUDView('game_hud_deploy_commit');
    };
    document.getElementById('game_hud_deployment_deploy_tab').onclick = function () {
        changedHUDView('game_hud_deploy_deploy');
    };
}

function removeFromDeploymentResources(valueToRemove) {
    var defaultDeploymentValue = parseInt(document.getElementById('default-deployment-value').textContent);
    var harvestValue = parseInt(document.getElementById('harvest-value').textContent);

    if (defaultDeploymentValue >= valueToRemove) {
        document.getElementById('default-deployment-value').textContent = String(defaultDeploymentValue - valueToRemove);
    } else {
        document.getElementById('default-deployment-value').textContent = "0";
        document.getElementById('harvest-value').textContent = String((harvestValue + defaultDeploymentValue) - valueToRemove);
    }
}

function addToDeploymentResources(valueToAdd) {
    var harvestValue = parseInt(document.getElementById('harvest-value').textContent);
    document.getElementById('harvest-value').textContent = String(harvestValue + valueToAdd);
}

function toggleDeploymentSubPanelButtons(activateButtons) {
    if (activateButtons) {
        document.getElementById("inc-tank").onclick = function () {
            var tankCost = 2;
            var defaultDeploymentValue = parseInt(document.getElementById('default-deployment-value').textContent);
            var harvestValue = parseInt(document.getElementById('harvest-value').textContent);
            var tankCount = parseInt(document.getElementById("tank-value").textContent);

            if ((tankCount + 1 <= 10) && ( (harvestValue + defaultDeploymentValue) >= tankCost )) {
                removeFromDeploymentResources(tankCost);
                document.getElementById("tank-value").textContent = String(tankCount + 1);
            }
        };
        document.getElementById("dec-tank").onclick = function () {
            var tankCost = 2;
            var tankCount = parseInt(document.getElementById("tank-value").textContent);
            if ((tankCount - 1 >= 0)) {
                addToDeploymentResources(tankCost);
                document.getElementById("tank-value").textContent = String(tankCount - 1);
            }
        };
        document.getElementById("inc-ranged").onclick = function () {
            var rangedCost = 1;
            var defaultDeploymentValue = parseInt(document.getElementById('default-deployment-value').textContent);
            var harvestValue = parseInt(document.getElementById('harvest-value').textContent);
            var rangedCount = parseInt(document.getElementById("ranged-value").textContent);
            if ((rangedCount + 1 <= 10) && ( (harvestValue + defaultDeploymentValue) >= rangedCost )) {
                removeFromDeploymentResources(rangedCost);
                document.getElementById("ranged-value").textContent = String(rangedCount + 1);
            }
        };
        document.getElementById("dec-ranged").onclick = function () {
            var rangedCost = 1;
            var rangedCount = parseInt(document.getElementById("ranged-value").textContent);
            if (rangedCount - 1 >= 0) {
                addToDeploymentResources(rangedCost);
                document.getElementById("ranged-value").textContent = String(rangedCount - 1);
            }
        };
        document.getElementById("inc-infantry").onclick = function () {
            var infantryCost = 1;
            var defaultDeploymentValue = parseInt(document.getElementById('default-deployment-value').textContent);
            var harvestValue = parseInt(document.getElementById('harvest-value').textContent);
            var infantryCount = parseInt(document.getElementById("infantry-value").textContent);
            if ((infantryCount + 1 <= 10) && ( (harvestValue + defaultDeploymentValue) >= infantryCost )) {
                removeFromDeploymentResources(infantryCost);
                document.getElementById("infantry-value").textContent = String(infantryCount + 1);
            }
        };
        document.getElementById("dec-infantry").onclick = function () {
            var infantryCost = 1;
            var infantryCount = parseInt(document.getElementById("infantry-value").textContent);
            if (infantryCount - 1 >= 0) {
                addToDeploymentResources(infantryCost);
                document.getElementById("infantry-value").textContent = String(infantryCount - 1);
            }
        };
    } else {
        document.getElementById("inc-tank").onclick = null;
        document.getElementById("dec-tank").onclick = null;
        document.getElementById("inc-ranged").onclick = null;
        document.getElementById("dec-ranged").onclick = null;
        document.getElementById("inc-infantry").onclick = null;
        document.getElementById("dec-infantry").onclick = null;
    }
}

function displayDeploymentCommitTab(deployData) {
    document.getElementById('game_hud_deployment_commit_tab').style.display = 'block';
    changedHUDView('game_hud_deploy_commit');
    toggleDeploymentSubPanelButtons(true);

    var playerRace = getPlayersRace();
    document.getElementById('default-deployment-value').innerHTML = deployData[playerRace].defaultDeployment;

    document.getElementById("commit-deploy-button").onclick = function () {
        toggleDeploymentSubPanelButtons(false);
        document.getElementById('game_hud_deployment_commit_tab').style.display = 'none';
        changedHUDView('game_hud_deploy_commit');

        var infantryToDeploy = parseInt(document.getElementById('infantry-value').textContent);
        var rangedToDeploy = parseInt(document.getElementById('ranged-value').textContent);
        var tanksToDeploy = parseInt(document.getElementById('tank-value').textContent);

        var deploymentInfo = {
            infantryToDeploy: infantryToDeploy,
            rangedToDeploy: rangedToDeploy,
            tanksToDeploy: tanksToDeploy,
            playerRace: playerRace,
            playerName: playerName,
            gameRoom: gameRoom
        };

        game_socket.emit('commitDeploymentResources', deploymentInfo);
    };
}

function displayDeploymentDeployTab(deploymentInfo) {
    hideModal();
    document.getElementById('game_hud_deployment_deploy_tab').style.display = 'block';
    changedHUDView('game_hud_deploy_deploy', true);
    let race = getPlayersRace();
    document.getElementById('committed-infantry-value').textContent = deploymentInfo[race].infantryToDeploy;
    document.getElementById('committed-ranged-value').textContent = deploymentInfo[race].rangedToDeploy;
    document.getElementById('committed-tank-value').textContent = deploymentInfo[race].tanksToDeploy;
    document.getElementById('infantry-deploy-value').textContent = "0";
    document.getElementById('ranged-deploy-value').textContent = "0";
    document.getElementById('tank-deploy-value').textContent = "0";
    document.getElementById("deploy-deploy-button").style.backgroundColor = "#1d9d74";
    add_onclick_events_to_deploy_elements();
}

function hideAndResetDeploymentElements() {
    document.getElementById('game_hud_deploy_deploy').classList.remove('activeHud');
    document.getElementById('game_hud_deploy_deploy').classList.add('hudContainer');
    document.getElementById('game_hud_deployment_deploy_tab').style.display = 'none';
    document.getElementById('infantry-deploy-value').textContent = "0";
    document.getElementById('ranged-deploy-value').textContent = "0";
    document.getElementById('tank-deploy-value').textContent = "0";
    document.getElementById('infantry-value').textContent = "0";
    document.getElementById('ranged-value').textContent = "0";
    document.getElementById('tank-value').textContent = "0";
    document.getElementById("inc-deploy-tank").onclick = null;
    document.getElementById("dec-deploy-tank").onclick = null;
    document.getElementById("inc-deploy-ranged").onclick = null;
    document.getElementById("dec-deploy-ranged").onclick = null;
    document.getElementById("inc-deploy-infantry").onclick = null;
    document.getElementById("dec-deploy-infantry").onclick = null;
    document.getElementById("deploy-deploy-button").onclick = null;
}

function add_onclick_events_to_deploy_elements() {
    document.getElementById("inc-deploy-tank").onclick = function () {
        var committedValue = parseInt(document.getElementById('committed-tank-value').textContent);
        var deployValue = parseInt(document.getElementById('tank-deploy-value').textContent);

        if (committedValue > 0) {
            document.getElementById('tank-deploy-value').textContent = String(deployValue + 1);
            document.getElementById('committed-tank-value').textContent = String(committedValue - 1);
        }
    };
    document.getElementById("dec-deploy-tank").onclick = function () {
        var committedValue = parseInt(document.getElementById('committed-tank-value').textContent);
        var deployValue = parseInt(document.getElementById('tank-deploy-value').textContent);

        if (deployValue > 0) {
            document.getElementById('tank-deploy-value').textContent = String(deployValue - 1);
            document.getElementById('committed-tank-value').textContent = String(committedValue + 1);
        }
    };
    document.getElementById("inc-deploy-ranged").onclick = function () {
        var committedValue = parseInt(document.getElementById('committed-ranged-value').textContent);
        var deployValue = parseInt(document.getElementById('ranged-deploy-value').textContent);

        if (committedValue > 0) {
            document.getElementById('ranged-deploy-value').textContent = String(deployValue + 1);
            document.getElementById('committed-ranged-value').textContent = String(committedValue - 1);
        }
    };
    document.getElementById("dec-deploy-ranged").onclick = function () {
        var committedValue = parseInt(document.getElementById('committed-ranged-value').textContent);
        var deployValue = parseInt(document.getElementById('ranged-deploy-value').textContent);

        if (deployValue > 0) {
            document.getElementById('ranged-deploy-value').textContent = String(deployValue - 1);
            document.getElementById('committed-ranged-value').textContent = String(committedValue + 1);
        }
    };
    document.getElementById("inc-deploy-infantry").onclick = function () {
        var committedValue = parseInt(document.getElementById('committed-infantry-value').textContent);
        var deployValue = parseInt(document.getElementById('infantry-deploy-value').textContent);

        if (committedValue > 0) {
            document.getElementById('infantry-deploy-value').textContent = String(deployValue + 1);
            document.getElementById('committed-infantry-value').textContent = String(committedValue - 1);
        }
    };
    document.getElementById("dec-deploy-infantry").onclick = function () {
        var committedValue = parseInt(document.getElementById('committed-infantry-value').textContent);
        var deployValue = parseInt(document.getElementById('infantry-deploy-value').textContent);

        if (deployValue > 0) {
            document.getElementById('infantry-deploy-value').textContent = String(deployValue - 1);
            document.getElementById('committed-infantry-value').textContent = String(committedValue + 1);
        }
    };

    document.getElementById("deploy-deploy-button").onclick = function () {
        document.getElementById("deploy-deploy-button").style.backgroundColor = "#617676";
        document.getElementById("inc-deploy-tank").onclick = null;
        document.getElementById("dec-deploy-tank").onclick = null;
        document.getElementById("inc-deploy-ranged").onclick = null;
        document.getElementById("dec-deploy-ranged").onclick = null;
        document.getElementById("inc-deploy-infantry").onclick = null;
        document.getElementById("dec-deploy-infantry").onclick = null;
        document.getElementById("deploy-deploy-button").onclick = null;

        let infantry = parseInt(document.getElementById('infantry-deploy-value').textContent);
        let ranged = parseInt(document.getElementById('ranged-deploy-value').textContent);
        let tank = parseInt(document.getElementById('tank-deploy-value').textContent);

        highlightDeploymentOptions(getPlayersRace(), true, infantry, ranged, tank);
    };
}