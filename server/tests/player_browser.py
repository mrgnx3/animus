from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.ui import Select


class Player:
    def __init__(self, player_name, server_url='http://127.0.0.1:5000/', timeout=5):
        self.timeout = timeout
        self.player_name = player_name
        self.driver = webdriver.Chrome()
        self.server_url = server_url

    def open_page(self, url):
        self.driver.get(url)
        self.wait_for_page_complete()

    def wait_for_page_complete(self):
        def document_complete(driver):
            return driver.execute_script("return (document.readyState == 'complete')")

        WebDriverWait(self.driver, self.timeout).until(document_complete, message='Wait for page load complete')

    def wait_for_redirect(self, url_context):
        WebDriverWait(self.driver, 10).until(lambda driver: url_context not in self.driver.current_url)

    def login_new_user(self):
        self.open_page(self.server_url)
        self.driver.find_element_by_id('newUserTxtInput').send_keys(self.player_name)
        self.driver.find_element_by_id('newUserButton').click()
        self.wait_for_page_complete()

    def login_get_welcome_text(self):
        return self.driver.find_element_by_id('welcomeText').text

    def create_game(self, game_name, player_count='2'):
        self.driver.find_element_by_id('gameNameInput').send_keys(game_name)
        select = Select(self.driver.find_element_by_id('playerCountSelector'))
        select.select_by_value(player_count)
        self.driver.find_element_by_id('createGameButton').click()
        self.wait_for_redirect('login')

    def join_game(self, game_name):
        return 1
