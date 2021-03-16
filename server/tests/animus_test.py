import nose
import time
from flask_testing import LiveServerTestCase
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from server.animus import app
from server.tests.player_browser import Player, UnitType
import multiprocessing

class AnimusTest(LiveServerTestCase):
    player_one = None
    player_two = None

    def create_app(self):
        self.app = app.test_client()
        self.app.testing = True
        return app

    @classmethod
    def setUpClass(cls):
        # This line is required to avoid
        # "Can't pickle local object 'LiveServerTestCase._spawn_live_server.<locals>.worker'"
        # https://github.com/pytest-dev/pytest-flask/issues/104
        # hits python 3.8+
        multiprocessing.set_start_method("fork")

        cls.mongo_client = MongoClient()
        cls.game_name = "testGame"
        try:
            cls.mongo_client.admin.command('ismaster')
            cls.mongo_client.animus.game.remove({"name": "{0}".format(cls.game_name)})
        except ConnectionFailure:
            print("Mongodb server not available")
            exit(1)

        headless = False
        cls.post_test_wait = False
        
        cls.player_one = Player('player_one', headless=headless)
        cls.player_one.driver.set_window_position(0, 0, windowHandle='current')
        cls.player_one.driver.maximize_window()
        cls.dem = cls.player_one.driver.get_window_size()
        
        cls.player_one.driver.set_window_position(0, 0, windowHandle='current')
        cls.player_one.driver.set_window_size(cls.dem['width'] // 2, cls.dem['height'])

        cls.player_two = Player('player_two', headless=headless)
        cls.player_two.driver.set_window_position(0, 0, windowHandle='current')
        cls.player_two.driver.set_window_size(cls.dem['width'] // 2, cls.dem['height'])
        cls.player_two.driver.set_window_position(cls.dem['width'] // 2, 0, windowHandle='current')

    @classmethod
    def tearDownClass(cls):
        cls.player_one.driver.quit()
        cls.player_two.driver.quit()

    def test_two_player_game_start_to_end(self):
        self.player_one_race = 'Geoengineers'
        self.player_two_race = 'Settlers'
        
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
        self.assertTrue(self.player_two.check_lobby_messages_for('Hi are you ready to play?'))
        self.assertTrue(self.player_one.check_lobby_messages_for('Sure are you ready to get your ass handed to you?'))

        self.player_one.claim_race(race=self.player_one_race, hero='attack')
        self.player_two.claim_race(race=self.player_two_race, hero='defence')

        player_one_log = self.player_one.driver.get_log('browser')
        for log_entry in player_one_log:
            self.assertNotIn('err', log_entry)
            self.assertNotIn('fail', log_entry)

        # Game - Setup
        self.assertTrue(self.player_one.wait_for_redirect('game'), msg="game started, player 1 in Game")
        self.assertTrue(self.player_two.wait_for_redirect('game'), msg="game started, player 2 in Game")

        # Game - Dismiss welcome modal
        self.assertTrue(self.player_one.dismiss_modal())
        self.assertTrue(self.player_two.dismiss_modal())

        # Game - Set orders
        self.player_one.set_order_for_index(index=76, set_order='harvest')
        self.player_two.set_order_for_index(index=77, set_order='harvest')

        self.player_one.set_order_for_index(index=52, set_order='move')
        self.player_two.set_order_for_index(index=53, set_order='move')

        # Game - Move attack
        self.player_one.move_all_units(origin=52, target=51)
        self.player_two.move_all_units(origin=53, target=52)

        # Game - Harvest
        self.assertTrue(self.player_one.check_harvest_information(self.player_one_race, '1'))
        self.assertTrue(self.player_two.check_harvest_information(self.player_two_race, '1'))
    
        # Game - Recruit commit
        self.player_one.click_add_unit(UnitType.INFANTRY, 4)
        self.player_one.click_add_unit(UnitType.TANK, 1)
        self.player_one.commit_resources()
        self.assertEquals(self.player_one.get_waiting_on_info(), 'player_two')
        self.player_two.commit_resources()
        self.assertEquals(self.player_two.get_waiting_on_info(), 'All Players Ready')

        # Game -  Deployment
        
        # Game - Event cards

        # Game - End of round

        # Game - Winning condition

        # Post Game Screen
        if(self.post_test_wait):
            time.sleep(360)

        # Sucess


if __name__ == "__main__":
    nose.main()
