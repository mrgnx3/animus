from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_pymongo import PyMongo

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

app.config['MONGO_HOST'] = 'localhost'
app.config['MONGO_PORT'] = 27017
app.config['MONGO_DBNAME'] = 'animus'
mongo = PyMongo(app, config_prefix='MONGO')


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('games_to_join')
def display_games_to_join():
    game = mongo.db.games.find_one()
    emit('my_response', {"gameName": game['name']})


if __name__ == '__main__':
    socketio.run(app)
