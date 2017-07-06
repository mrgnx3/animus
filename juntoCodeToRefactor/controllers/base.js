var mongoose = require('mongoose');
var Base = mongoose.model('Base');

exports.index = function (req, res) {
  res.render('games/viewGame');
};

exports.getMap = function (req, res) {
  var _query = Base.find();
  _query.exec(function (err, data) {
    if (err) return next(err);
    res.setHeader("Content-Type", 'application/jsonp');
    res.jsonp(data);
  });
};

exports.getRaceHistory = function (req, res) {
  var race = req.url.replace(/\/getRaceHistory.*\//, "");
  var data = Base.schema.flavourText[race].history;
  res.setHeader("Content-Type", 'application/jsonp');
  res.jsonp(data);
};

exports.getLeaderBio = function (req, res) {
  var leader = req.url.replace(/\/getLeaderBio.*\//, "");
  var race = req.url.replace("/getLeaderBio/", "").replace("/" + leader, "");
  var data = Base.schema.flavourText[race].leaderBio[leader];
  res.setHeader("Content-Type", 'application/jsonp');
  res.jsonp(data);
};