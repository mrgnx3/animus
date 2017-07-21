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
    Note:
    We test with muiltple browsers, so we need to modify flask_testing app run paramerters 
    edit site-packages/flask_testing/utils.py
    line: 473 app.run(port=port, use_reloader=False, *threaded=True*)
    
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
    
          Join Game (done)
             -> List games (done)
                  -> Join as <PlayerName> (done)
    
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