from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support import expected_conditions as EC


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
        self.wait_for_page_complete()

    def WebElement(self, elements):
        if isinstance(elements, list):
            elements = [WebElement(element._parent, element._id) for element in elements if element.is_displayed()]
        else:
            elements = WebElement(elements._parent, elements._id)
        return elements

    def find_dynamic_element(self, locator, timeout=10):
        element = WebDriverWait(self.driver, timeout).until(EC.visibility_of_element_located(locator))
        return self.WebElement(element)

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
        self.find_dynamic_element((By.ID, 'gameNameInput')).send_keys(game_name)
        select = Select(self.find_dynamic_element((By.ID, 'playerCountSelector')))
        select.select_by_value(player_count)
        self.find_dynamic_element((By.ID, 'createGameButton')).click()
        self.wait_for_redirect('login')

    def join_game(self, game_name):
        self.find_dynamic_element((By.ID, game_name), timeout=100).click()
        self.wait_for_redirect('login')
        return bool('login/' + game_name in self.driver.current_url)
