/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Games = mongoose.model('Games');
var Base = mongoose.model('Base');
var User = mongoose.model('User');
var utils = require('../../lib/utils');
var extend = require('util')._extend;
var winston = require('winston');


/**
 * Load
 */

exports.load = function (req, res, next, id) {
  var User = mongoose.model('User');

  Games.load(id, function (err, Games) {
    if (err) return next(err);
    if (!Games) return next(new Error('not found'));
    req.Games = Games;
    next();
  });
};

/**
 * Home
 */

exports.index = function (req, res) {
  res.render('games/index');
};

/**
 * Dashboard
 */

exports.dashboard = function (req, res) {
  buildDashboard(req, res);
};

/**
 * New Games
 */

exports.new = function (req, res) {
  res.render('games/new', {
    title: 'New Games',
    Games: new Games({})
  });
};

exports.create = function (req, res) {
  var game = new Games();
  game.name = req.body.gameTitle;
  game.adminUser = req.user._doc.username;
  game.state.units = Base.getDefaultUnitsSetUp();

  game.save(function (err) {
    if (err) {
      if (err.code) {
        return res.render('games/dashboard', {
          error: 'An active game already has that name try something different',
          title: 'Error Creating Game',
          gameList: {},
          gamesToJoin: {}

        });
      } else {
        return res.render('games/dashboard', {
          error: utils.errors(err.errors),
          title: 'Error Creating Game'
        });
      }
    }
    buildDashboard(req, res);
  });
};

function buildDashboard(req, res) {
  function doRender(gameList, gamesToJoin) {
    res.render('games/dashboard', {gameList: gameList, gamesToJoin: gamesToJoin});
  }

  function getOpenGames(req, gameList) {
    Games.getOpenGamesList(req.user._doc.username, gameList, doRender);
  }

  Games.getUsersGamesList(req, getOpenGames);
}

exports.viewGame = function (req, res) {
  var gameTitle = req.url.replace("/games/view/", "");
  winston.info("Viewing gameTitle: " + gameTitle);
  var gameDoc;

  // To do: rewrite this nonsense
  function setGameDoc(data) {
    gameDoc = data;
  }

  function doRender(race) {
    res.render('games/viewGame', {gameList: gameDoc, username: req.user._doc.username, raceName: race});
  }

  Games.getGameByTitle(req.user._doc.username, gameTitle, setGameDoc);
  Games.getPlayersRace(gameTitle, req.user._doc.username, doRender);
};

exports.viewGameLobby = function (req, res) {
  var gameTitle = req.url.replace("/games/lobby/", "");
  Games.getGameByTitle(req.user._doc.username, gameTitle, parseLobbyData);

  function parseLobbyData(gameDoc) {
    var _usersList = [];

    if (!gameDoc["0"]._doc) {
      return res.render('games/dashboard', {
        error: 'This is not the game you are looking for.. jedi shit',
        title: 'Unable to join',
        gameList: {},
        gamesToJoin: {}
      });
    } else if (gameDoc["0"]._doc.userList.uuids.length >= 6) {
      return res.render('games/dashboard', {
        error: 'Too many people in this lobby',
        title: 'Unable to join',
        gameList: {},
        gamesToJoin: {}
      });
    } else {
      gameDoc["0"]._doc.userList.uuids.forEach(function (uuid) {
        _usersList.push(uuid);
      });
      doRender(_usersList);
    }
  }

  function doRender(usersList) {
    res.render('games/lobby', {usersList: usersList, userName: req.user.username});
  }
};

/**
 * Edit an Games
 */

exports.getMapUnits = function (req, res) {
  var gameName = req.url.replace("/getMapUnits/", "");
  var _query = Games.find({"name": gameName}, {"state.units": 1});
  _query.exec(function (err, data) {
    if (err) return winston.info("getMapUnits failed with: " + err);
    res.setHeader("Content-Type", 'application/jsonp');
    res.jsonp(data[0].state.units);
  });
};

exports.getGamesRoundPhaseInfo = function (req, res) {
  var gameName = req.url.replace("/getGamesRoundPhaseInfo/", "");
  var _query = Games.find({"name": gameName});
  _query.exec(function (err, data) {
    if (err) return winston.info("getGamesRoundPhaseInfo failed with: " + err);
    res.setHeader("Content-Type", 'application/jsonp');
    res.jsonp(data[0].state);
  });
};

exports.getPlayersRace = function (req, res) {
  var player = req.url.replace("/getPlayersRace/", "").replace(/\/.*/, "");
  var game = req.url.replace("/getPlayersRace/", "").replace(/.*\//, "");

  var _query = Games.find({"name": game}, {"userList": 1});
  _query.exec(function (err, data) {
    if (err) return winston.info("getPlayersRace failed with: " + err);

    var userList = data[0]._doc.userList;
    switch (player) {
      case userList.guardians:
        sendResponse(res, "guardians");
        break;
      case userList.reduviidae:
        sendResponse(res, "reduviidae");
        break;
      case userList.periplaneta:
        sendResponse(res, "periplaneta");
        break;
      case userList.kingdomWatchers:
        sendResponse(res, "kingdomWatchers");
        break;
      case userList.settlers:
        sendResponse(res, "settlers");
        break;
      case userList.geoEngineers:
        sendResponse(res, "geoEngineers");
        break;
    }

    function sendResponse(res, race) {
      res.setHeader("Content-Type", 'application/jsonp');
      res.jsonp({race: race});
    }
  });
};

/**
 * Get game stats for HUD
 */

exports.getHudStatistics = function (req, res) {
  var raceName = req.url.replace(/\/getHudStatistics.*\//, "");
  var gameName = req.url.replace("/getHudStatistics/", "").replace("/" + raceName, "");
  var _query = Games.find({"name": gameName}, {"state.units": 1});
  _query.exec(function (err, data) {
    if (err) return winston.error("Get Hud statistics failed with error: " + err);
    res.setHeader("Content-Type", 'application/jsonp');
    res.jsonp(getArmyStrength(raceName, data[0]._doc.state.units, gameName));
  });
};

function getArmyStrength(race, units, game) {
  var infantry = 0;
  var ranged = 0;
  var tank = 0;
  units.forEach(function (army) {
    if (army.race != null) {
      if (army.race.toLowerCase() == race.toLowerCase()) {
        infantry += army.infantry;
        ranged += army.ranged;
        tank += army.tanks;
      }
    }
  });
  return ({infantry: infantry, ranged: ranged, tank: tank, game: game});
}

/**
 * Update Games
 */

exports.update = function (req, res) {
  var Games = req.Games;
  var images = req.files.image
  ? [req.files.image]
  : undefined;

  // make sure no one changes the user
  delete req.body.user;
  Games = extend(Games, req.body);

  Games.uploadAndSave(images, function (err) {
    if (!err) {
      return res.redirect('/games/' + Games._id);
    }

    res.render('games/edit', {
      title: 'Edit Games',
      Games: Games,
      errors: utils.errors(err.errors || err)
    });
  });
};

/**
 * Show
 */


exports.show = function (req, res) {
  res.render('games/show', {
    title: req.Games.title,
    Games: req.Games
  });
};

/**
 * Delete
 */

exports.destroy = function (req, res) {
  var Games = req.Games;
  Games.remove(function () {
    req.flash('info', 'Deleted successfully');
    res.redirect('/games');
  });
};
