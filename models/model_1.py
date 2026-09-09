from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time
import requests
import json
from server import start_server_in_thread

'''
    CodingJr Semantrix Solver - Model 1
    Uses Datamuse API (https://api.datamuse.com/words?ml=...) for fast, accurate semantic word association.
'''


def run_model(url="http://localhost:8000"):
    # Ensure local server is running in background thread
    start_server_in_thread(8000)

    # Open web driver and navigate to local game
    try:
        driver = webdriver.Chrome()
    except Exception:
        driver = webdriver.Chrome("./chromedriver")

    print(f"[CodingJr] Opening game at: {url}")
    driver.get(url)

    # Allow game time to initialize
    time.sleep(3)

    # Auto-click 'Play Arcade' button if on landing page
    try:
        start_btn = driver.find_element("id", "btn-start-arcade")
        if start_btn.is_displayed():
            start_btn.click()
            time.sleep(1)
    except Exception:
        pass

    wordlist = []
    words = []
    index = 0
    target_index = 0

    while True:

        # Word/Words for which we need to find similar words
        TARGET = []

        # Sometimes target lines take time to load so we wait until its loaded
        while not TARGET:
            try:
                TARGET = driver.execute_script(
                    "return this.game.currentGame.targetLines") or []
            except Exception:
                TARGET = []
            if not TARGET:
                time.sleep(0.5)

        # Target Reset condition
        if target_index > 0 and len(TARGET) >= target_index and index >= len(words):
            target_index = 0

        print("Current Target:", TARGET)

        # If the target is multiple word (like book name) we need to modify it so we can use API call
        curr_target = TARGET[min(target_index, len(TARGET) - 1)]
        formatted_target = curr_target.replace(' ', '+')

        # Saving all targets
        wordlist.append(formatted_target)

        # Comparing if our submitted word worked correctly. If not so we increase index so we can take
        # Next word from the list of similar words for current target
        if len(wordlist) > 1 and wordlist[-1] == wordlist[-2]:
            index += 1
        else:
            try:
                res = requests.get(
                    f'https://api.datamuse.com/words?ml={formatted_target}', timeout=5)
                words = res.json()
            except Exception as e:
                print("Datamuse API notice:", e)
                words = []
            index = 0

        # Out of bound so we move to next word
        if len(words) <= index:
            target_index = (target_index + 1) % len(TARGET)
            continue

        bestMatch = words[index]['word']
        print("Best Match:", bestMatch)

        # Manually check if the target and best match have some common prefixes
        # As it violates game rules
        if bestMatch[:3].lower() in formatted_target.lower():
            index += 1
            continue

        # We input our best match
        driver.execute_script(
            f'this.game.currentGame.userSubmit("{bestMatch}","{bestMatch}")')

        # Sleep for some time
        time.sleep(2 - len(wordlist) * 0.01 if 2 >=
                   len(wordlist) * 0.01 else 0.2)

        # Once game is over we print the score
        # BOARD: 4, ENDED: 3, PLAYING: 2, READY: 1
        try:
            game_state = driver.execute_script(
                "return this.game.currentGame.state")
            if str(game_state) == "3":
                print("Final Score:", driver.execute_script(
                    "return this.game.currentGame.points"))
                break
        except Exception:
            pass

    driver.close()
