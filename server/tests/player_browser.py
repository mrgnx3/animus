from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait


class Player:
    def __init__(self, player_name, timeout=5):
        self.timeout = timeout
        self.player_name = player_name
        self.driver = webdriver.Chrome()

    def open_page(self, url):
        self.driver.get(url)
        self.wait_for_page_complete()

    def wait_for_page_complete(self,):
        def document_complete(driver):
            return driver.execute_script("return (document.readyState == 'complete')")

        WebDriverWait(self.driver, self.timeout).until(document_complete, message='Wait for page load complete')
