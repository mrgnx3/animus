from flask import Flask, render_template, json, request
from flask_socketio import SocketIO, emit, join_room, leave_room, send

import server.lib.game_model as gm

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

Game = gm.GameModel()

app.debug = True


@app.route('/')
def index():
    return render_template('./site/index.html', games=gm.get_games_available_to_join())


@app.route('/game/<game_name>', methods=['GET'])
def view_game(game_name):
    user_name = request.cookies['animusUser']
    game_doc = gm.get_game_by_name(game_name)
    for race in game_doc['active_races']:
        if game_doc[race]['username'] == user_name:
            return render_template('./game/gameView.html', game_name=game_name, user_name=user_name, race_name=race)
    return render_template('./404.html')


@app.route('/getBaseBoard', methods=['GET'])
def get_base_board():
    return json.dumps(gm.get_base_map())


@app.route('/getMapUnits/<game_name>', methods=['GET'])
def get_map_units(game_name):
    return json.dumps(gm.get_game_by_name(game_name).units)


@app.route('/getPlayersRace/<player_name>/<game_name>', methods=['GET'])
def get_players_race(player_name, game_name):
    return json.dumps({'race': gm.get_players_race(game_name, player_name)})


@app.route('/getActiveRaces/<game_name>', methods=['GET'])
def get_active_races(game_name):
    return json.dumps({'active_races': gm.get_game_by_name(game_name).active_races})


@app.route('/getHudStatistics/<game_name>/<race>', methods=['GET'])
def get_hud_statistics(game_name, race):
    infantry = 0
    ranged = 0
    tank = 0
    for army in gm.get_game_by_name(game_name).units:
        if army['race'] == race:
            infantry += int(army['infantry'])
            ranged += int(army['ranged'])
            tank += int(army['tanks'])
    return json.dumps({'infantry': infantry, 'ranged': ranged, 'tank': tank, 'game': game_name})


@app.route('/getGamesRoundPhaseInfo/<game_name>', methods=['GET'])
def get_games_round_phase_info(game_name):
    game = gm.get_game_by_name(game_name)
    return json.dumps({'round': game.round, 'phase': game.phase, 'activePlayer': [game.active_player]})


@app.route('/lobby/<game_name>', methods=['GET'])
def view_lobby(game_name):
    # todo add 404 game not found clause
    active_races = [race.title() for race in gm.get_game_by_name(game_name).active_races]
    return render_template('./site/lobby.html', active_races=active_races, game_name=game_name)


@app.route('/gamecheck/<game_name>', methods=['GET'])
def game_name_is_available(game_name):
    return json.dumps({"gameNameIsAvailable": bool(len(gm.get_game_by_name(game_name)) == 0)})


@app.route('/gamesToJoin/', methods=['GET'])
def games_to_join():
    return json.dumps({"gameList": gm.get_games_available_to_join()})


@app.route('/createGame/<game_name>/playerCount/<player_count>', methods=['GET'])
def create_game(game_name, player_count):
    if bool(Game.create_game(game_name, int(player_count))):
        socketio.emit('update_game_list', room='home_page')
        return json.dumps({"gameCreated": True})
    return json.dumps({"gameCreated": False})


@app.route('/racecheck/<game_name>/race/<race>/player/<player>', methods=['GET'])
def race_check(game_name, race, player):
    if gm.lock_in_race_if_available(game_name, race, player):
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
    gm.hero_selected(data['race'], data['hero_type'], data['game_name'], data['player_name'])
    if gm.all_races_are_claimed(data['game_name']):
        gm.close_lobby(data['game_name'])
        emit('start_game', room=data['game_name'])


if __name__ == '__main__':
    socketio.run(app)
