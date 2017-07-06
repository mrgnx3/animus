from flask import Flask, render_template, json
from flask_socketio import SocketIO, emit

from server.lib.game_model import GameModel

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

games = GameModel()
app.debug = True


@app.route('/')
def index():
    return render_template('./site/index.html', games=games.get_games_available_to_join())


@app.route('/lobby/<game_name>', methods=['POST'])
def view_lobby(game_name):
    return json.dumps({"msg": "user created"})


if __name__ == '__main__':
    socketio.run(app)
