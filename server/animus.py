from flask import Flask, render_template, json, request
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


@app.route('/game/<game_name>', methods=['GET'])
def view_game(game_name):
    user_name = request.cookies['animusUser']
    game_doc = games.get_game_by_name(game_name)[0]
    for race in game_doc['active_races']:
        if game_doc[race]['username'] == user_name:
            return render_template('./game/gameView.html', game_name=game_name, user_name=user_name, race_name=race)
    return render_template('./404.html')


@app.route('/getBaseBoard', methods=['GET'])
def get_base_board():
    return json.dumps(games.get_base_map())


@app.route('/lobby/<game_name>', methods=['GET'])
def view_lobby(game_name):
    # todo add 404 game not found clause
    active_races = [race.title() for race in games.get_game_by_name(game_name)[0].active_races]
    return render_template('./site/lobby.html', active_races=active_races, game_name=game_name)


@app.route('/gamecheck/<game_name>', methods=['GET'])
def game_name_is_available(game_name):
    return json.dumps({"gameNameIsAvailable": bool(len(games.get_game_by_name(game_name)) == 0)})


@app.route('/gamesToJoin/', methods=['GET'])
def games_to_join():
    return json.dumps({"gameList": games.get_games_available_to_join()})


@app.route('/createGame/<game_name>/playerCount/<player_count>', methods=['GET'])
def create_game(game_name, player_count):
    if bool(games.create_game(game_name, int(player_count))):
        socketio.emit('update_game_list', room='home_page')
        return json.dumps({"gameCreated": True})
    return json.dumps({"gameCreated": False})


@app.route('/racecheck/<game_name>/race/<race>/player/<player>', methods=['GET'])
def race_check(game_name, race, player):
    if games.lock_in_race_if_available(game_name, race, player):
        socketio.emit('lobby_race_lock', {"race": race, "player": player}, room=game_name)
        return json.dumps({"raceIsAvailable": True})
    else:
        return json.dumps({"raceIsAvailable": False})


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


@socketio.on('hero_selected')
def hero_selected(data):
    games.hero_selected(data['race'], data['hero_type'], data['game_name'], data['player_name'])
    if games.all_races_are_claimed(data['game_name']):
        games.close_lobby(data['game_name'])
        emit('start_game', room=data['game_name'])


if __name__ == '__main__':
    socketio.run(app)
