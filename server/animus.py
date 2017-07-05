from datetime import datetime
from flask import Flask, render_template, json
from flask_socketio import SocketIO, emit
from flask_pymongo import PyMongo

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

app.config['MONGO_HOST'] = 'localhost'
app.config['MONGO_PORT'] = 27017
app.config['MONGO_DBNAME'] = 'animus'
mongo = PyMongo(app, config_prefix='MONGO')

app.debug = True


@app.route('/')
def index():
    return render_template('./site/index.html')


@app.route('/createUser/<user>')
def create_user(user):
    mongo.db.users.update_one(
        {"username": user},
        {"$set": {"username": user, "last_active": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}},
        upsert=True
    )
    return json.dumps({"msg": "user created"})


@socketio.on('games_to_join')
def display_games_to_join():
    game = mongo.db.games.find_one()
    emit('my_response', {"gameName": game['name']})


if __name__ == '__main__':
    socketio.run(app)


    # app.get('/login', users.login);
    # app.get('/signup', users.signup);
    # app.get('/logout', users.logout);
    # app.post('/users', users.create);
    # app.post('/users/session',
    # passport.authenticate('local', {
    # failureRedirect: '/login',
    # failureFlash: 'Invalid email or password.'
    # }), users.session);
    # app.get('/users/:userId', users.show);
    # app.param('userId', users.load);
    #
    # app.get('/getBaseBoard', base.getMap);
    # app.get('/getMapUnits/:game', games.getMapUnits);
    # app.get('/getPlayersRace/:player/:game', games.getPlayersRace);
    # app.get('/getGamesRoundPhaseInfo/:game', games.getGamesRoundPhaseInfo);
    # app.get('/getHudStatistics/:game/:race', games.getHudStatistics);
    # app.get('/getRaceHistory/:race', base.getRaceHistory);
    # app.get('/getLeaderBio/:race/:leader', base.getLeaderBio);
    # app.get('/games', games.index);
    # app.get('/games/user/:userId', auth.requiresLogin, games.dashboard);
    # app.post('/games/user/:userId', auth.requiresLogin, games.create);
    # app.get('/games/view/:gameName', auth.requiresLogin, games.viewGame);
    # app.get('/games/lobby/:gameName', auth.requiresLogin, games.viewGameLobby);
    # app.get('/games/:id', games.show);
    # app.put('/games/:id', gamesAuth, games.update);
    # app.delete('/games/:id', gamesAuth, games.destroy);
    #
    # // home route
    # app.get('/', games.index);
    # app.get('/status', status.getStatus);
