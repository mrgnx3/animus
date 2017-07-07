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


@app.route('/lobby/<game_name>', methods=['GET'])
def view_lobby(game_name):
    return render_template('./site/lobby.html')


@app.route('/gamecheck/<game_name>', methods=['GET'])
def game_name_is_available(game_name):
    return json.dumps({"gameNameIsAvailable": bool(len(games.get_game_by_name(game_name)) == 0)})


@app.route('/createGame/<game_name>/playerCount/<player_count>', methods=['GET'])
def create_game(game_name, player_count):
    return json.dumps({"gameCreated": bool(games.create_game(game_name, player_count))})


if __name__ == '__main__':
    socketio.run(app)
