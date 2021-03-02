import json
from datetime import datetime

import mongoengine as meng

RACES = ["geoengineers", "settlers", "kingdomwatchers", "periplaneta", "reduviidae", "guardians"]

class LobbyUser(meng.EmbeddedDocument):
    username = meng.StringField(required=True)
    is_ready = meng.BooleanField(default=False)


class RaceInfo(meng.EmbeddedDocument):
    race = meng.StringField(required=True)
    username = meng.StringField(default='')

    hero_name = meng.StringField()
    hero_defence_modifier = meng.IntField(default=0)
    hero_attack_modifier = meng.IntField(default=0)
    hero_harvest_modifier = meng.IntField(default=0)

    harvest_count = meng.IntField(default=0)
    harvest_collection_rate = meng.IntField(default=1)

    deployment_default = meng.IntField(default=1)
    deployment_total = meng.IntField(default=0)
    deployment_infantry_count = meng.IntField(default=0)
    deployment_ranged_count = meng.IntField(default=0)
    deployment_tanks_count = meng.IntField(default=0)

    units = meng.ListField()


class Game(meng.Document):
    name = meng.StringField(max_length=60, required=True, unique=True)
    player_count = meng.IntField(required=True)
    active_races = meng.ListField(required=True)

    round = meng.IntField(default=1)
    phase = meng.StringField(default='orders')
    phase_waiting_on = meng.ListField(default=[])
    race_in_play = meng.StringField(default='')

    action_order = meng.ListField(default=[])
    move_order_list = meng.ListField(default=[])

    units = meng.ListField()
    rounds_max_number = meng.IntField(default=3)

    uuids = meng.ListField()
    geoengineers = meng.EmbeddedDocumentField(RaceInfo)
    settlers = meng.EmbeddedDocumentField(RaceInfo)
    kingdomwatchers = meng.EmbeddedDocumentField(RaceInfo)
    periplaneta = meng.EmbeddedDocumentField(RaceInfo)
    reduviidae = meng.EmbeddedDocumentField(RaceInfo)
    guardians = meng.EmbeddedDocumentField(RaceInfo)

    races_to_commit = meng.ListField()
    races_to_deploy = meng.ListField()

    chat_log = meng.ListField()
    game_log = meng.ListField()

    display_open_modal = meng.ListField()

    is_lobby_open = meng.BooleanField(default=True)
    lobby_status = meng.ListField(meng.EmbeddedDocumentField(LobbyUser))
    created_at = meng.DateTimeField(default=datetime.now())


class GameModel:
    def __init__(self, host='localhost', port=27017, db_name='animus'):
        meng.connect(db_name, host=host, port=port)

    @staticmethod
    def create_game(game_name, player_count=2):
        geoengineers = RaceInfo(race='geoengineers')
        settlers = RaceInfo(race='settlers')
        kingdomwatchers = RaceInfo(race='kingdomwatchers')
        periplaneta = RaceInfo(race='periplaneta')
        reduviidae = RaceInfo(race='reduviidae')
        guardians = RaceInfo(race='guardians')

        if player_count == 2:
            units = get_base_units(player_count=player_count)
            active_races = ['geoengineers', 'settlers']
            action_order = ["geoengineers", "settlers"]
            geoengineers.deployment_default = 5
            kingdomwatchers = None
            periplaneta = None
            reduviidae = None
            guardians = None
        elif player_count == 3:
            units = get_base_units(player_count=player_count)
            active_races = ['geoengineers', 'settlers', 'kingdomwatchers']
            action_order = ["geoengineers", "settlers", "kingdomwatchers"]
            periplaneta = None
            reduviidae = None
            guardians = None
        elif player_count == 4:
            units = get_base_units(player_count=player_count)
            active_races = [
                'geoengineers', 'settlers', 'kingdomwatchers', 'periplaneta'
            ]
            action_order = [
                "geoengineers", "settlers", "kingdomwatchers", "periplaneta"
            ]
            reduviidae = None
            guardians = None
        elif player_count == 5:
            units = get_base_units(player_count=player_count)
            active_races = [
                'geoengineers', 'settlers', 'kingdomwatchers', 'periplaneta',
                'reduviidae'
            ]
            action_order = [
                "geoengineers", "settlers", "kingdomwatchers", "periplaneta",
                "reduviidae"
            ]
            guardians = None
        else:
            units = get_base_units(player_count=player_count)
            active_races = [
                'geoengineers', 'settlers', 'kingdomwatchers', 'periplaneta',
                'reduviidae', 'guardians'
            ]
            action_order = [
                "geoengineers", "settlers", "kingdomwatchers", "periplaneta",
                "reduviidae", "guardians"
            ]

        return Game(name=game_name,
                    player_count=player_count,
                    active_races=active_races,
                    geoengineers=geoengineers,
                    settlers=settlers,
                    kingdomwatchers=kingdomwatchers,
                    periplaneta=periplaneta,
                    reduviidae=reduviidae,
                    guardians=guardians,
                    units=units,
                    action_order=action_order).save()


def get_base_map():
    return {
        "map":
            [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0],
                [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0],
                [0, 0, 0, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0],
                [0, 0, 0, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 3, 0],
                [0, 0, 0, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 3, 0],
                [0, 0, 0, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0],
                [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 1, 1, 3, 1, 1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 1, 1, 1, 1, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 1, 1, 1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 1, 1, 1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
    }


def get_base_units(player_count=2):
    if player_count == 2:
        return [{
            "race": "geoengineers",
            "posX": 4,
            "posY": 3,
            "index": 76,
            "infantry": 1,
            "ranged": 1,
            "tanks": 1,
            "infantry_selected": False,
            "ranged_selected": False,
            "tanks_selected": False,
            "order": "notSet",
            "token_is_active": False
        }, {
            "race": "geoengineers",
            "posX": 4,
            "posY": 2,
            "index": 52,
            "infantry": 2,
            "ranged": 2,
            "tanks": 4,
            "infantry_selected": False,
            "ranged_selected": False,
            "tanks_selected": False,
            "order": "notSet",
            "token_is_active": False
        }, {
            "race": "settlers",
            "posX": 5,
            "posY": 2,
            "index": 53,
            "infantry": 1,
            "ranged": 2,
            "tanks": 1,
            "infantry_selected": False,
            "ranged_selected": False,
            "tanks_selected": False,
            "order": "notSet",
            "token_is_active": False
        }, {
            "race": "settlers",
            "posX": 5,
            "posY": 3,
            "index": 77,
            "infantry": 0,
            "ranged": 0,
            "tanks": 1,
            "infantry_selected": False,
            "ranged_selected": False,
            "tanks_selected": False,
            "order": "notSet",
            "token_is_active": False
        }]
    else:
        return None


def get_game_by_name(game_name: str) -> Game:
    game = Game.objects.filter(name=game_name)
    if len(game) > 0:
        return game[0]


def get_games_available_to_join():
    return [game.name for game in Game.objects(is_lobby_open=True)]


def lock_in_race_if_available(game_name, race, player):
    game = Game.objects.filter(name=game_name)[0]
    race = race.lower()
    if game[race]['username'] == '':
        game[race]['username'] = player
        game.save()
        return True
    else:
        return False


def hero_selected(race, hero_type, game_name, player_name):
    game = Game.objects.filter(name=game_name)[0]

    lobby_lock_in = LobbyUser(username=player_name, is_ready=True)
    game['lobby_status'].append(lobby_lock_in)

    race = race.lower()
    game[race]['hero_name'] = player_name + '_' + hero_type
    if hero_type == 'attack':
        game[race]['hero_attack_modifier'] = 1
    elif hero_type == 'defence':
        game[race]['hero_attack_modifier'] = -1
        game[race]['hero_defence_modifier'] = 3
    else:
        game[race]['hero_harvest_modifier'] = 2
    game.save()
    log(
        game_name,
        f'{player_name} has selected a hero of type: \'{hero_type}\' for race {race}'
    )


def all_races_are_claimed(game_name):
    game = Game.objects.filter(name=game_name)[0]
    return len(game['lobby_status']) == game['player_count']


def close_lobby(game_name):
    game = Game.objects.filter(name=game_name)[0]
    game['is_lobby_open'] = False
    game.save()


def get_players_race(game_name, player_name):
    game_doc = get_game_by_name(game_name)
    for race in game_doc['active_races']:
        if game_doc[race]['username'] == player_name:
            return race
    return None


def get_players_race_info(game_name, player_name):
    game_doc = get_game_by_name(game_name)
    for race in game_doc['active_races']:
        if game_doc[race]['username'] == player_name:
            return game_doc[race]
    return None


def get_lore(race, lore_type='history'):
    lore = {
        "geoengineers": {
            "history":
            "<h1>Fear The Many Faced God</h1><img src='http://orig02.deviantart.net/08ea/f/2011/312/2/0/experiments___janus_by_jeffsimpsonkh-d4fkwyl.jpg' style='width:80%; margin-left:9%;margin-right:9%'/><p>Kingdom watchers coming to fuck you up</p>",
            "attack_leader_bio":
            "<h1>Tough as nails</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
            "defence_leader_bio":
            "<h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
            "business_leader_bio":
            "<h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>"
        },
        "settlers": {
            "history":
            "<h1>We've been here longer than you</h1><img src='http://orig13.deviantart.net/a1f7/f/2012/094/e/c/ancient_battle_by_wraithdt-d4v1v25.jpg' style='width:80%; margin-left:9%;margin-right:9%'/><p>Periplaneta are old as shit</p>",
            "attack_leader_bio":
            "<h1>Tough as nails</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
            "defence_leader_bio":
            "<h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
            "business_leader_bio":
            "<h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>"
        }
    }

    return lore[race][lore_type]


def set_waiting_on_to_all(game_name):
    game_doc = get_game_by_name(game_name)
    game_doc['phase_waiting_on'].extend(
        [game_doc[race]['username'] for race in game_doc['active_races']])
    game_doc.save()


def display_opening_modal_check(game_name, user):
    return user not in get_game_by_name(game_name)['display_open_modal']


def add_user_to_modal_displayed_list(game_name, user):
    game_doc = get_game_by_name(game_name)
    game_doc['display_open_modal'].append(user)
    game_doc.save()
    log(game_name, f"Adding {user} to opening modal display list")


def log(game_name, msg, level='info', location='game_log'):
    game_doc = get_game_by_name(game_name)
    game_doc[location].append(f"{level}: {msg}")
    game_doc.save()


def set_player_order(action, game_name, index):
    game_doc = get_game_by_name(game_name)
    for idx, unit in enumerate(game_doc.units):
        if index == unit['index']:
            game_doc.units[idx]['order'] = action
            game_doc.save()
            return


def remove_player_from_waiting_on_list(game_name, player):
    game_doc = get_game_by_name(game_name)
    index_to_remove = game_doc.phase_waiting_on.index(player)
    game_doc.phase_waiting_on.pop(index_to_remove)
    game_doc.save()
    return game_doc.phase_waiting_on


def set_phase(game, phase):
    game_doc = get_game_by_name(game)
    game_doc.phase = phase
    game_doc.save()


def update_harvest_totals(game):
    game_doc = get_game_by_name(game)

    for idx, unit in enumerate(game_doc.units):
        if "harvest" == unit['order']:
            game_doc.units[idx]['order'] = "done"
            race = game_doc.units[idx]['race']
            game_doc[race]["harvest_count"] += 1 * game_doc[race][
                "harvest_collection_rate"]
    game_doc.save()


def set_races_with_moves_orders_list(game):
    game_doc = get_game_by_name(game)
    races_with_moves_left = list()

    for idx, unit in enumerate(game_doc.units):
        if "move" == unit['order']:
            if game_doc.units[idx]['race'] not in races_with_moves_left:
                races_with_moves_left.append(game_doc.units[idx]['race'])

    game_doc.move_order_list = sorted(races_with_moves_left,
                                      key=game_doc.action_order.index)
    game_doc.save()
    return game_doc.move_order_list


def get_race_in_play(game):
    return get_game_by_name(game).race_in_play


def set_active_race(game, race):
    log(game, f"Marking {race} as active race", level='debug')
    game_doc = get_game_by_name(game)
    game_doc.race_in_play = race
    game_doc.save()


def mark_unit_as_selected(game, unit_type, index):
    log(game, f"mark_unit_as_selected: {unit_type}, {index}", level='debug')

    game_doc = get_game_by_name(game)
    for idx, unit in enumerate(game_doc.units):
        if index == unit['index']:
            unit_selected = '{0}_selected'.format(unit_type)
            game_doc.units[idx][unit_selected] = True
            game_doc.save()


def index_has_units(game, target_index):
    game_doc = get_game_by_name(game)
    for idx, unit in enumerate(game_doc.units):
        if target_index == unit['index']:
            return (game_doc.units[idx]["infantry"] +
                    game_doc.units[idx]["ranged"] +
                    game_doc.units[idx]["tanks"]) > 0
    return False


def units_are_friendly(game, origin_index, target_index):
    origin_race = None
    target_race = None
    game_doc = get_game_by_name(game)
    for unit in game_doc.units:
        if origin_index == unit['index']:
            origin_race = unit['race']
        elif target_index == unit['index']:
            target_race = unit['race']

    return origin_race == target_race


def create_unit_entry(game, index, race):
    game_doc = get_game_by_name(game)
    game_doc.units.append({
        "posX": index % 24,
        "posY": int(index / 24),
        "index": index,
        "race": race,
        "infantry": 0,
        "ranged": 0,
        "tanks": 0,
        "infantry_selected": False,
        "ranged_selected": False,
        "tanks_selected": False,
        "token_is_active": False,
        "order": "done"
    })
    game_doc.save()


def clean_up_index_if_empty(game, index):
    game_doc = get_game_by_name(game)
    for idx, unit in enumerate(game_doc.units):
        if index == unit['index']:
            if game_doc.units[idx]['infantry'] + game_doc.units[idx][
                    'ranged'] + game_doc.units[idx]['tanks'] == 0:
                game_doc.units.pop(idx)
                game_doc.save()
            return game_doc.units[idx]['race']


def is_tile_empty(game, index):
    game_doc = get_game_by_name(game)
    for unit in game_doc.units:
        if index == unit['index']:
            return False
    return True


def move_selected_units_into_new_index(game, origin_index, target_index):
    target_index_needs_instance_created = True
    origin_unit = None

    # Check if target exists
    game_doc = get_game_by_name(game)
    for unit in game_doc.units:
        if target_index == unit['index']:
            target_index_needs_instance_created = False
        elif origin_index == unit['index']:
            origin_unit = unit

    if target_index_needs_instance_created:
        create_unit_entry(game, index=target_index, race=origin_unit['race'])

    # Store units to move and clear from origin
    game_doc = get_game_by_name(game)
    to_move = []
    for unit_type in ["infantry", "ranged", "tanks"]:
        if origin_unit["{0}_selected".format(unit_type)]:
            for idx, unit in enumerate(game_doc.units):
                if origin_index == unit['index']:
                    to_move.append((unit_type, game_doc.units[idx][unit_type]))
                    game_doc.units[idx][unit_type] = 0
                    game_doc.units[idx]["{0}_selected"] = False
    game_doc.save()

    # Move units into target index
    game_doc = get_game_by_name(game)
    for idx, unit in enumerate(game_doc.units):
        if target_index == unit['index']:
            for unit in to_move:
                game_doc.units[idx][unit[0]] = unit[1]
    game_doc.save()

    return clean_up_index_if_empty(game, origin_index)


def set_order_for_tile_to(game, origin_index, order_value):
    game_doc = get_game_by_name(game)
    for idx, unit in enumerate(game_doc.units):
        if origin_index == unit['index']:
            game_doc.units[idx]['order'] = order_value
            game_doc.save()


def set_movement_token_as_active(game, tile_index):
    game_doc = get_game_by_name(game)
    for idx, unit in enumerate(game_doc.units):
        if tile_index == unit['index']:
            game_doc.units[idx]['token_is_active'] = True
            game_doc.save()

def get_deployment_data(game: str) -> dict:
    deployment_data = {}
    game_doc = get_game_by_name(game)
    for race in RACES:
        if game_doc[race]:
            deployment_data[race] = json.loads(game_doc[race].to_json())
    return deployment_data
