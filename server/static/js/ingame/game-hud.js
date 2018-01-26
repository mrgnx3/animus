function updateHudStatistics(stats) {
    for (let race in stats) {
        document.getElementById(race + '-harvest-count').innerHTML = String(stats[race].harvestCount);
        document.getElementById(race + '-harvest-rate').innerHTML = 'x' + String(stats[race].harvestRate);
        document.getElementById(race + '-infantry').innerHTML = String(stats[race].infantry);
        document.getElementById(race + '-ranged').innerHTML = String(stats[race].ranged);
        document.getElementById(race + '-tanks').innerHTML = String(stats[race].tanks);
    }
}

function addHudListeners() {
    document.getElementById('game-information-tab').onclick = function () {
        let gameInfoHud = document.getElementById('game-information-hud');
        let gameHudContainer = document.getElementById('game-hud');
        if (gameInfoHud.style.display === 'none') {
            gameInfoHud.style.display = 'flex';
            gameHudContainer.style.height = '30%';
        } else {
            gameInfoHud.style.display = 'none';
            gameHudContainer.style.height = null;
        }
    };
    getHudStatistics(updateHudStatistics);
}

function removeFromDeploymentResources(valueToRemove) {
    let defaultDeploymentValue = parseInt(document.getElementById('default-deployment-value').textContent);
    let harvestValue = parseInt(document.getElementById('harvest-value').textContent);

    if (defaultDeploymentValue >= valueToRemove) {
        document.getElementById('default-deployment-value').textContent = String(defaultDeploymentValue - valueToRemove);
    } else {
        document.getElementById('default-deployment-value').textContent = "0";
        document.getElementById('harvest-value').textContent = String((harvestValue + defaultDeploymentValue) - valueToRemove);
    }
}

function addToDeploymentResources(valueToAdd) {
    let harvestValue = parseInt(document.getElementById('harvest-value').textContent);
    document.getElementById('harvest-value').textContent = String(harvestValue + valueToAdd);
}

function toggleDeploymentSubPanelButtons(activateButtons) {
    if (activateButtons) {
        document.getElementById("inc-tank").onclick = function () {
            let tankCost = 2;
            let defaultDeploymentValue = parseInt(document.getElementById('default-deployment-value').textContent);
            let harvestValue = parseInt(document.getElementById('harvest-value').textContent);
            let tankCount = parseInt(document.getElementById("tank-value").textContent);

            if ((tankCount + 1 <= 10) && ( (harvestValue + defaultDeploymentValue) >= tankCost )) {
                removeFromDeploymentResources(tankCost);
                document.getElementById("tank-value").textContent = String(tankCount + 1);
            }
        };
        document.getElementById("dec-tank").onclick = function () {
            let tankCost = 2;
            let tankCount = parseInt(document.getElementById("tank-value").textContent);
            if ((tankCount - 1 >= 0)) {
                addToDeploymentResources(tankCost);
                document.getElementById("tank-value").textContent = String(tankCount - 1);
            }
        };
        document.getElementById("inc-ranged").onclick = function () {
            let rangedCost = 1;
            let defaultDeploymentValue = parseInt(document.getElementById('default-deployment-value').textContent);
            let harvestValue = parseInt(document.getElementById('harvest-value').textContent);
            let rangedCount = parseInt(document.getElementById("ranged-value").textContent);
            if ((rangedCount + 1 <= 10) && ( (harvestValue + defaultDeploymentValue) >= rangedCost )) {
                removeFromDeploymentResources(rangedCost);
                document.getElementById("ranged-value").textContent = String(rangedCount + 1);
            }
        };
        document.getElementById("dec-ranged").onclick = function () {
            let rangedCost = 1;
            let rangedCount = parseInt(document.getElementById("ranged-value").textContent);
            if (rangedCount - 1 >= 0) {
                addToDeploymentResources(rangedCost);
                document.getElementById("ranged-value").textContent = String(rangedCount - 1);
            }
        };
        document.getElementById("inc-infantry").onclick = function () {
            let infantryCost = 1;
            let defaultDeploymentValue = parseInt(document.getElementById('default-deployment-value').textContent);
            let harvestValue = parseInt(document.getElementById('harvest-value').textContent);
            let infantryCount = parseInt(document.getElementById("infantry-value").textContent);
            if ((infantryCount + 1 <= 10) && ( (harvestValue + defaultDeploymentValue) >= infantryCost )) {
                removeFromDeploymentResources(infantryCost);
                document.getElementById("infantry-value").textContent = String(infantryCount + 1);
            }
        };
        document.getElementById("dec-infantry").onclick = function () {
            let infantryCost = 1;
            let infantryCount = parseInt(document.getElementById("infantry-value").textContent);
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

    let playerRace = getPlayersRace();
    document.getElementById('default-deployment-value').innerHTML = deployData[playerRace].defaultDeployment;

    document.getElementById("commit-deploy-button").onclick = function () {
        toggleDeploymentSubPanelButtons(false);
        document.getElementById('game_hud_deployment_commit_tab').style.display = 'none';
        changedHUDView('game_hud_deploy_commit');

        let infantryToDeploy = parseInt(document.getElementById('infantry-value').textContent);
        let rangedToDeploy = parseInt(document.getElementById('ranged-value').textContent);
        let tanksToDeploy = parseInt(document.getElementById('tank-value').textContent);

        let deploymentInfo = {
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
        let committedValue = parseInt(document.getElementById('committed-tank-value').textContent);
        let deployValue = parseInt(document.getElementById('tank-deploy-value').textContent);

        if (committedValue > 0) {
            document.getElementById('tank-deploy-value').textContent = String(deployValue + 1);
            document.getElementById('committed-tank-value').textContent = String(committedValue - 1);
        }
    };
    document.getElementById("dec-deploy-tank").onclick = function () {
        let committedValue = parseInt(document.getElementById('committed-tank-value').textContent);
        let deployValue = parseInt(document.getElementById('tank-deploy-value').textContent);

        if (deployValue > 0) {
            document.getElementById('tank-deploy-value').textContent = String(deployValue - 1);
            document.getElementById('committed-tank-value').textContent = String(committedValue + 1);
        }
    };
    document.getElementById("inc-deploy-ranged").onclick = function () {
        let committedValue = parseInt(document.getElementById('committed-ranged-value').textContent);
        let deployValue = parseInt(document.getElementById('ranged-deploy-value').textContent);

        if (committedValue > 0) {
            document.getElementById('ranged-deploy-value').textContent = String(deployValue + 1);
            document.getElementById('committed-ranged-value').textContent = String(committedValue - 1);
        }
    };
    document.getElementById("dec-deploy-ranged").onclick = function () {
        let committedValue = parseInt(document.getElementById('committed-ranged-value').textContent);
        let deployValue = parseInt(document.getElementById('ranged-deploy-value').textContent);

        if (deployValue > 0) {
            document.getElementById('ranged-deploy-value').textContent = String(deployValue - 1);
            document.getElementById('committed-ranged-value').textContent = String(committedValue + 1);
        }
    };
    document.getElementById("inc-deploy-infantry").onclick = function () {
        let committedValue = parseInt(document.getElementById('committed-infantry-value').textContent);
        let deployValue = parseInt(document.getElementById('infantry-deploy-value').textContent);

        if (committedValue > 0) {
            document.getElementById('infantry-deploy-value').textContent = String(deployValue + 1);
            document.getElementById('committed-infantry-value').textContent = String(committedValue - 1);
        }
    };
    document.getElementById("dec-deploy-infantry").onclick = function () {
        let committedValue = parseInt(document.getElementById('committed-infantry-value').textContent);
        let deployValue = parseInt(document.getElementById('infantry-deploy-value').textContent);

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