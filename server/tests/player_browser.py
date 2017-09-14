import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support import expected_conditions as EC, ui


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

    def wait_for_redirect(self, url_context, timeout=10):
        for i in range(timeout):
            if url_context in self.driver.current_url:
                self.wait_for_page_complete()
                return self.driver.current_url
            time.sleep(1)
        return False

    def WebElement(self, elements):
        if isinstance(elements, list):
            elements = [WebElement(element._parent, element._id) for element in elements if element.is_displayed()]
        else:
            elements = WebElement(elements._parent, elements._id)
        return elements

    def find_dynamic_element_by_id(self, id_string, timeout=10):
        time.sleep(0.5)
        self.wait_for_page_complete()
        wait = ui.WebDriverWait(self.driver, timeout)
        wait.until(lambda driver: self.driver.find_element_by_id(id_string))
        return self.WebElement(self.driver.find_element_by_id(id_string))

    def find_dynamic_elements(self, locator, timeout=10):
        condition = EC.presence_of_all_elements_located(locator)
        elements = WebDriverWait(self.driver, timeout).until(condition)
        return self.WebElement(elements)

    def login_new_user(self):
        self.open_page(self.server_url)
        self.driver.find_element_by_id('newUserTxtInput').send_keys(self.player_name)
        self.driver.find_element_by_id('newUserButton').click()
        self.wait_for_page_complete()

    def login_get_welcome_text(self):
        return self.driver.find_element_by_id('welcomeText').text

    def create_game(self, game_name, player_count='2'):
        self.find_dynamic_element_by_id('gameNameInput').send_keys(game_name)
        select = Select(self.find_dynamic_element_by_id('playerCountSelector'))
        select.select_by_value(player_count)
        self.find_dynamic_element_by_id('createGameButton').click()
        self.wait_for_redirect('lobby')

    def join_game(self, game_name):
        self.find_dynamic_element_by_id(game_name, timeout=30).click()
        return self.wait_for_redirect('lobby')

    def sends_lobby_message(self, message):
        self.find_dynamic_element_by_id('chatInputField').send_keys(message)
        self.find_dynamic_element_by_id('sendMessage').click()

    def get_lobby_messages(self):
        return self.find_dynamic_element_by_id('chatContent').text

    def claim_race(self, race, hero):
        race_buttons = self.find_dynamic_elements((By.CLASS_NAME, 'claimRaceButton'))
        for race_button in list(race_buttons):
            if race_button.get_attribute('race') == race:
                race_button.click()
                self.wait_for_page_complete()
                self.find_dynamic_element_by_id("hero-button-{0}-{1}".format(race, hero)).click()
                self.wait_for_page_complete()

    def set_orders_to_movement(self):
        orders = list(self.find_dynamic_elements(
            (By.XPATH, "//i[contains(@class, 'fa fa-plus rotate action-display')]")))

        for idx, order in enumerate(orders):
            order.click()
            time.sleep(1)
            self.find_dynamic_elements(
                (By.XPATH, "//i[contains(@class, 'fa fa-arrow-right move-action')]"))[idx].click()
            time.sleep(1)

    def move_all_units(self, origin, target):
        self.find_dynamic_elements(
            (By.XPATH, "//i[contains(@class, 'fa rotate action-display fa-arrow-right')]"))[1].click()
        time.sleep(0.3)
        self.find_dynamic_elements((By.XPATH, '//*[@id="y_3"]//div[@id="x_4"]/*[2]/*[1]/*[2]'))[0].click()
        self.find_dynamic_elements((By.XPATH, '//*[@id="y_4"]//div[@id="x_4"]'))[0].click()
