# animus

## Dependencies:

    - An instance of mongod needs to be running
    
       $ mongod  --dbpath /var/animus
    
    - After which the setup/db_init.js script can be run to create the mongo schema
       $ mongo -h localhost animus < db.init.js


##Setup Steps

    virtualenv venv
    source venv/bin/activate
    pip install -r requirements.txt
    
    python animus.py
    
    
## What I'm looking to build

    Base Site Flow flow
    
      ->  Opening Screen
    
          Create Game
             -> Name
             -> Number of Players
             -> Join as <PlayerName>
    
          Join Game
             -> List games
                  -> Join as <PlayerName>
    
      -> Lobby
    
          -> Chat
          -> Random Race/ Hero selector
          -> Ready status
          -> Start game button
    
    
      -> In Game:
          -> Display
              -> Board
              -> Units
              -> HUD
              -> Game state info
              -> In game chat
    
          Game Phases:
    
              -> Orders
              -> Movements/Attacks
              -> Harvest/Interact
              -> Recruiting / Deployment
              -> Event cards
    
      -> End game Screen