/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var config = require('../../config/config');

var Schema = mongoose.Schema;

/**
 * Base Schema
 */

var BaseSchema = new Schema({
  map: {}
});

BaseSchema.methods = {};
BaseSchema.statics = {
  getDefaultUnitsSetUp: function () {
    return [
      {
        "posX": 4,
        "posY": 3,
        "index": 76,
        "race": "kingdomWatchers",
        "infantry": 1,
        "ranged": 1,
        "tanks": 1,
        "order": "notSet"
      },
      {
        "posX": 4,
        "posY": 2,
        "index": 52,
        "race": "kingdomWatchers",
        "infantry": 2,
        "ranged": 2,
        "tanks": 4,
        "order": "notSet"
      },
      {
        "posX": 5,
        "posY": 2,
        "index": 53,
        "race": "periplaneta",
        "infantry": 1,
        "ranged": 2,
        "tanks": 1,
        "order": "notSet"
      },
      {
        "posX": 5,
        "posY": 3,
        "index": 77,
        "race": "periplaneta",
        "infantry": 0,
        "ranged": 0,
        "tanks": 1,
        "order": "notSet"
      }
    ];
  }
};

BaseSchema.flavourText = {
  "kingdomWatchers": {
    "history": "<h1>Fear The Many Faced God</h1><img src='http://orig02.deviantart.net/08ea/f/2011/312/2/0/experiments___janus_by_jeffsimpsonkh-d4fkwyl.jpg' style='width:80%; margin-left:9%;margin-right:9%'/><p>Kingdom watchers coming to fuck you up</p>",
    "leaderBio": {
      "leader_1": "<h1>Tough as nails</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
      "leader_2": "<h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>"
    }
  },
  "periplaneta": {
    "history": "<h1>We've been here longer than you</h1><img src='http://orig13.deviantart.net/a1f7/f/2012/094/e/c/ancient_battle_by_wraithdt-d4v1v25.jpg' style='width:80%; margin-left:9%;margin-right:9%'/><p>Periplaneta are old as shit</p>",
    "leaderBio": {
      "leader_1": "<h1>Tough as nails</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
      "leader_2": "<h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>"
    }
  }
};

mongoose.model('Base', BaseSchema, 'base');