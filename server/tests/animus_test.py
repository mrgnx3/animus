import nose
import time
from flask_testing import LiveServerTestCase
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from server.animus import app
from server.tests.player_browser import Player


class AnimusTest(LiveServerTestCase):
    player_one = None
    player_two = None

    def create_app(self):
        self.app = app.test_client()
        self.app.testing = True
        return app

    @classmethod
    def setUpClass(cls):
        cls.mongo_client = MongoClient()
        cls.game_name = "testGame"
        try:
            cls.mongo_client.admin.command('ismaster')
            cls.mongo_client.animus.game.remove({"name": "{0}".format(cls.game_name)})
        except ConnectionFailure:
            print("Mongodb server not available")
            exit(1)

        cls.player_one = Player('player_one')
        cls.player_two = Player('player_two')

    @classmethod
    def tearDownClass(cls):
        cls.player_one.driver.quit()
        cls.player_two.driver.quit()

    def test_two_player_game_start_to_end(self):
        # Register / Login
        self.player_one.login_new_user()
        self.player_two.login_new_user()

        self.assertIn(self.player_one.player_name, self.player_one.login_get_welcome_text(), msg="player 1 login works")
        self.assertIn(self.player_two.player_name, self.player_two.login_get_welcome_text(), msg="player 2 login works")

        # Create Game
        self.player_one.create_game(self.game_name)
        self.assertIn('lobby', self.player_one.driver.current_url, msg="game created, player 1 in lobby")
        self.assertTrue(self.player_two.join_game(self.game_name), msg="player 2 game joined game lobby")

        # PreGame Lobby
        self.player_one.sends_lobby_message('Hi are you ready to play?')
        self.player_one.sends_lobby_message('Sure are you ready to get your ass handed to you?')
        self.assertIn('Hi are you ready to play?', self.player_two.get_lobby_messages())
        self.assertIn('Sure are you ready to get your ass handed to you?', self.player_one.get_lobby_messages())

        self.player_one.claim_race(race='Geoengineers', hero='attack')
        self.player_two.claim_race(race='Settlers', hero='defence')

        player_one_log = self.player_one.driver.get_log('browser')
        for log_entry in player_one_log:
            self.assertNotIn('err', log_entry)
            self.assertNotIn('fail', log_entry)

        # Game
        self.assertTrue(self.player_one.wait_for_redirect('game'), msg="game started, player 1 in Game")
        self.assertTrue(self.player_two.wait_for_redirect('game'), msg="game started, player 2 in Game")

        self.player_one.find_dynamic_element_by_id('gameModalBody').click()
        self.player_two.find_dynamic_element_by_id('gameModalBody').click()

        self.player_one.set_orders_to_movement()
        self.player_two.set_orders_to_movement()

        self.player_one.move_all_units(origin=76, target=75)

        # Post Game Screen
        time.sleep(60)


if __name__ == "__main__":
    nose.main()
