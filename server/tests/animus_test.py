import nose
from flask_testing import LiveServerTestCase
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from server.animus import app
from server.tests.player_browser import Player


class LoginTest(LiveServerTestCase):
    def create_app(self):
        self.app = app.test_client()
        self.app.testing = True
        return app

    @classmethod
    def setUpClass(cls):
        cls.mongo_client = MongoClient()

        try:
            cls.mongo_client.admin.command('ismaster')
        except ConnectionFailure:
            print("Mongodb server not available")
            exit(1)

        cls.player_one = Player('player_one')
        cls.player_two = Player('player_two')

    @classmethod
    def tearDownClass(cls):
        cls.player_one.driver.quit()
        cls.player_two.driver.quit()

    def test_create_game_with_new_users(self):
        self.player_one.open_page(self.get_server_url())
        self.player_two.open_page(self.get_server_url())

        self.player_one.driver.find_element_by_id('newUserTxtInput').send_keys('player_one')
        self.player_one.driver.find_element_by_id('newUserButton').click()
        self.player_one.wait_for_page_complete()
        player_one_welcome = self.player_one.driver.find_element_by_id('welcomeText').text

        self.player_two.driver.find_element_by_id('newUserTxtInput').send_keys('player_two')
        self.player_two.driver.find_element_by_id('newUserButton').click()
        self.player_two.wait_for_page_complete()
        player_two_welcome = self.player_two.driver.find_element_by_id('welcomeText').text

        self.assertIn(self.player_one.player_name, player_one_welcome, msg="Player should be welcomed by name")
        self.assertIn(self.player_two.player_name, player_two_welcome, msg="Player should be welcomed by name")


if __name__ == "__main__":
    nose.main()
