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
    
##Testing
    export PATH=$PATH:<PATH_TO_SeleniumDrivers>
    export PYTHONPATH=$(pwd)
    
    source venv/bin/activate
    
    nosetests server/tests/animus_test.py
    
    
## What I'm looking to build

    Base Site Flow flow
    
      ->  Opening Screen (done)
    
          Create Game (done)
             -> Name  (done)
             -> Number of Players (done)
             -> Join as <PlayerName> (done)
    
          Join Game
             -> List games
                  -> Join as <PlayerName>
    
      -> Lobby
    
          -> Chat (done)
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