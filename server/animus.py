from flask import Flask, render_template, json
from flask_socketio import SocketIO, emit, join_room, leave_room, send

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
    # todo add 404 game not found clause
    active_races = [race.title() for race in games.get_game_by_name(game_name)[0].active_races]
    return render_template('./site/lobby.html', active_races=active_races, game_name=game_name.title())


@app.route('/gamecheck/<game_name>', methods=['GET'])
def game_name_is_available(game_name):
    return json.dumps({"gameNameIsAvailable": bool(len(games.get_game_by_name(game_name)) == 0)})


@app.route('/gamesToJoin/', methods=['GET'])
def games_to_join():
    return json.dumps({"gameList": games.get_games_available_to_join()})


@app.route('/createGame/<game_name>/playerCount/<player_count>', methods=['GET'])
def create_game(game_name, player_count):
    socketio.emit('update_game_list', room='home_page')
    return json.dumps({"gameCreated": bool(games.create_game(game_name, int(player_count)))})


@socketio.on('join_lobby')
def on_join_lobby(data):
    join_room(data['game_name'])
    message = "{0} has joined the lobby".format(data['username'])
    emit('new_message', {"username": '#', "message": message}, room=data['game_name'])


@socketio.on('send_message')
def send_message(data):
    emit('new_message', {"username": data['username'], "message": data['message']}, room=data['game_name'])


@socketio.on('enter_home_page')
def enter_home_page():
    join_room('home_page')


if __name__ == '__main__':
    socketio.run(app)
