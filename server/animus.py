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
            gm.log(game_name, '{0} has entered the game'.format(user_name))
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


@app.route('/getLeaderBio/<race>/<leader_type>', methods=['GET'])
def get_leader_bio(race, leader_type):
    return gm.get_lore(race, '{0}_leader_bio'.format(leader_type))


@app.route('/getRaceHistory/<race>', methods=['GET'])
def get_race_history(race):
    return json.dumps(gm.get_lore(race))


@app.route('/getGamesRoundPhaseInfo/<game_name>', methods=['GET'])
def get_games_round_phase_info(game_name):
    game = gm.get_game_by_name(game_name)
    gm.log(game_name, "getGamesRoundPhaseInfo called", level='debug')
    return json.dumps({'round': game.round, 'phase': game.phase, 'waitingOnPlayer': [game.phase_waiting_on]})


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
    gm.log(data['game_name'], data['message'], location='chat_log')
    emit('new_message', {"username": data['username'], "message": data['message']}, room=data['game_name'])


@socketio.on('enter_home_page')
def enter_home_page():
    join_room('home_page')


@socketio.on('hero_selected')
def hero_selected(data):
    gm.hero_selected(data['race'], data['hero_type'], data['game_name'], data['player_name'])
    if gm.all_races_are_claimed(data['game_name']):
        gm.close_lobby(data['game_name'])
        gm.set_waiting_on_to_all(data['game_name'])
        gm.log(data['game_name'], 'All players have selected a race and the game will now begin')
        emit('start_game', room=data['game_name'])


@socketio.on('joinGame')
def join_game(data):
    game_name = data['game_name']
    user = data['user']
    join_room(game_name, sid=user)

    race_info = gm.get_players_race_info(game_name, user)

    emit('updateHarvestInformation',
         {"harvest_count": race_info["harvest_count"], "harvest_collection_rate": race_info["harvest_collection_rate"]},
         room=game_name)

    # if gm.display_opening_modal_check(game_name, user):
    if True:
        gm.add_user_to_modal_displayed_list(game_name, user)
        emit('displayActionModal',
             {"message": "<h1>Welcome to the Game</h1><p>Place your Orders Mother fuckers!</p>"},
             room=game_name)


@socketio.on('lockInOrder')
def lock_in_order(action, game_name, index):
    gm.set_player_order(action, game_name, index)


@socketio.on('allOrdersAreSet')
def all_orders_are_set(game, player):
    waiting_on_list = gm.remove_player_from_waiting_on_list(game, player)
    if len(waiting_on_list) == 0:
        gm.log(game, "All player orders have been set for this round switching to movement phase".format(game))
        gm.set_phase(game, "movement")
        emit('refreshMapView', room=game)
        emit('updatePhaseInfo', room=game)


@socketio.on('resolveBattle')
def resolve_battle(gameRoom, playerName, attackersIndex, defendersIndex, attackingWith):
    pass


@socketio.on('moveOrderComplete')
def move_order_complete(room, user):
    pass


@socketio.on('peacefulMove')
def peaceful_move(movementDetails, cb):
    pass


@socketio.on('peacefulMerge')
def peaceful_merge(movementDetails, cb):
    pass


@socketio.on('removeAllUnitsInTile')
def remove_all_units_in_tile(gameRoom, removeUnitsFromThisTile):
    pass


@socketio.on('minusOneFromUnitValue')
def minus_one_from_units_in_tile(gameRoom, index, unitType):
    pass


@socketio.on('refreshUsersInGame')
def refresh_users_in_game(room):
    pass


@socketio.on('commitDeploymentResources')
def commit_deployment_resources(deploymentInfo):
    pass


@socketio.on('deploymentOfUnits')
def deployment_of_units(room, index, race, infantry, ranged, tanks, deploymentValues):
    pass


if __name__ == '__main__':
    socketio.run(app)
