from datetime import datetime
from mongoengine import *


class LobbyUser(EmbeddedDocument):
    username = StringField(required=True)
    is_ready = BooleanField(default=False)


class RaceInfo(EmbeddedDocument):
    race = StringField(required=True)
    username = StringField(default='')

    harvest_count = IntField(default=0)
    harvest_collection_rate = IntField(default=1)

    default_deployment = IntField(default=1)
    total_to_deployment = IntField(default=0)
    infantry_to_deployment = IntField(default=0)
    ranged_to_deployment = IntField(default=0)
    tanks_to_deployment = IntField(default=0)

    units = ListField()


class Game(Document):
    name = StringField(max_length=60, required=True, unique=True)
    player_count = IntField(required=True)
    active_races = ListField(required=True)

    round = IntField(default=1)
    phase = StringField(default='orders')
    phase_waiting_on = ListField()
    active_player = StringField(default='')
    units = ListField()
    rounds_max_number = IntField(default=3)

    uuids = ListField()
    geoEngineers = EmbeddedDocumentField(RaceInfo)
    settlers = EmbeddedDocumentField(RaceInfo)
    kingdomWatchers = EmbeddedDocumentField(RaceInfo)
    periplaneta = EmbeddedDocumentField(RaceInfo)
    reduviidae = EmbeddedDocumentField(RaceInfo)
    guardians = EmbeddedDocumentField(RaceInfo)

    races_to_commit = ListField()
    races_to_deploy = ListField()

    chat_log = ListField()
    game_log = ListField()

    display_open_modal = ListField()

    is_lobby_open = BooleanField(default=True)
    lobby_status = ListField(EmbeddedDocumentField(LobbyUser))
    created_at = DateTimeField(default=datetime.now())


class GameModel:
    def __init__(self, host='localhost', port=27017, db_name='animus'):
        connect(db_name, host=host, port=port)

    def create_game(self, game_name, player_count=2):
        geoEngineers = RaceInfo(race='geoEngineers')
        settlers = RaceInfo(race='settlers')
        kingdomWatchers = RaceInfo(race='kingdomWatchers')
        periplaneta = RaceInfo(race='periplaneta')
        reduviidae = RaceInfo(race='reduviidae')
        guardians = RaceInfo(race='guardians')

        if player_count == 2:
            active_races = ['geoEngineers', 'settlers']
            kingdomWatchers = None
            periplaneta = None
            reduviidae = None
            guardians = None
        elif player_count == 3:
            active_races = ['geoEngineers', 'settlers', 'kingdomWatchers']
            periplaneta = None
            reduviidae = None
            guardians = None
        elif player_count == 4:
            active_races = ['geoEngineers', 'settlers', 'kingdomWatchers', 'periplaneta']
            reduviidae = None
            guardians = None
        elif player_count == 5:
            active_races = ['geoEngineers', 'settlers', 'kingdomWatchers', 'periplaneta', 'reduviidae']
            guardians = None
        else:
            active_races = ['geoEngineers', 'settlers', 'kingdomWatchers', 'periplaneta', 'reduviidae', 'guardians']

        return Game(
            name=game_name,
            player_count=player_count,
            active_races=active_races,
            geoEngineers=geoEngineers,
            settlers=settlers,
            kingdomWatchers=kingdomWatchers,
            periplaneta=periplaneta,
            reduviidae=reduviidae,
            guardians=guardians
        ).save()

    @staticmethod
    def get_game_by_name(game_name):
        return Game.objects.filter(name=game_name)

    @staticmethod
    def get_games_available_to_join():
        return [game.name for game in Game.objects(is_lobby_open=True)]
