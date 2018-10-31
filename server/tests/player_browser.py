import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def get_hex_id_from_index(index):
    return 'x_{0}_y_{1}'.format(index % 24, index // 24)

class Player:
    def __init__(self, player_name, server_url='http://127.0.0.1:5000/', timeout=5, headless=True):
        options = Options()
        options.headless = headless
        self.timeout = timeout
        self.player_name = player_name
        self.driver = webdriver.Chrome(options=options)
        self.driver.implicitly_wait(10)
        self.wait = WebDriverWait(self.driver, self.timeout)
        self.server_url = server_url

    def open_page(self, url):
        self.driver.get(url)

    def wait_for_redirect(self, url_context):
        self.wait.until(EC.url_contains(url_context))
        return True

    def login_new_user(self):
        self.open_page(self.server_url)
        self.driver.find_element_by_id('newUserTxtInput').send_keys(self.player_name)
        self.driver.find_element_by_id('newUserButton').click()

    def login_get_welcome_text(self):
        return self.driver.find_element_by_id('welcomeText').text

    def create_game(self, game_name, player_count='2'):
        self.driver.find_element_by_id('gameNameInput').send_keys(game_name)
        select = Select(self.driver.find_element_by_id('playerCountSelector'))
        select.select_by_value(player_count)
        self.driver.find_element_by_id('createGameButton').click()
        self.wait_for_redirect('lobby')

    def join_game(self, game_name):
        self.driver.find_element_by_id(game_name).click()
        self.wait_for_redirect('lobby')
        return True

    def sends_lobby_message(self, message):
        self.driver.find_element_by_id('chatInputField').send_keys(message)
        self.driver.find_element_by_id('sendMessage').click()

    def check_lobby_messages_for(self, text):
        self.wait.until(EC.text_to_be_present_in_element((By.ID,'chatContent'),text))
        return True

    def claim_race(self, race, hero):
        race_buttons = self.driver.find_elements(By.CLASS_NAME, 'claimRaceButton')
        for race_button in list(race_buttons):
            if race_button.get_attribute('race') == race:
                race_button.click()
                self.driver.find_element_by_id("hero-button-{0}-{1}".format(race, hero)).click()

    def set_order_for_index(self, index, set_order):
        hex_id = get_hex_id_from_index(index)

        self.driver.find_element_by_id(hex_id).find_element_by_class_name('action-display').click()

        if set_order == 'harvest':
            action = 'harvest-action'
        elif set_order == 'defence':
            action = 'defence-action'
        elif set_order == 'recruit':
            action = 'recruit-action'
        else:
            action = 'move-action'

        time.sleep(0.3)
        self.driver.find_element_by_id(hex_id).find_element_by_class_name(action).click()

    def move_all_units(self, origin, target):
        time.sleep(2)
        origin_xpath = '//*[@id="x_{0}_y_{1}"]'.format(origin % 24, origin // 24)
        hex_element = self.driver.find_elements(By.XPATH, origin_xpath)[0]
        self.wait.until(EC.element_to_be_clickable((By.CLASS_NAME,'action-display'))).click()

        for unit in hex_element.find_elements_by_tag_name('g'):
            time.sleep(0.5)
            unit.click()

        target_xpath = '//*[@id="x_{0}_y_{1}"]'.format(target % 24, target // 24)
        self.driver.find_elements(By.XPATH, target_xpath)[0].click()

    def check_harvest_information(self, race, expected):
        self.driver.find_element_by_id('game-information-tab').click()
        return self.wait.until(EC.text_to_be_present_in_element((By.ID, "{0}-harvest-count".format(race.lower())), expected))

    def dismiss_modal(self):
        self.wait.until(EC.element_to_be_clickable((By.ID,'gameModalBody'))).click()
        return True