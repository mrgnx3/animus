# Animus

## Setup Steps

```bash
    virtualenv -p python3 venv
    source venv/bin/activate
    pip install -r requirements.txt
    ./in_memory_hot_patch.sh

    export PYTHONPATH=$(pwd)
    python server/animus.py
```

## Testing

```bash
    export PATH=$PATH:<PATH_TO_SeleniumDrivers>
    export PYTHONPATH=$(pwd)

    source venv/bin/activate

    nosetests server/tests/animus_test.py
```

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
          -> Random Race/ Hero selector (done)
          -> Ready status (done)
          -> Start game (done)


      -> In Game:
          -> Display
              -> Board (done)
              -> Units  (done)
              -> HUD     (done)
              -> Game state info (done)
              -> In game chat

          Game Phases:

              -> Orders  (done)
              -> Movements/Attacks
              -> Harvest/Interact
              -> Recruiting / Deployment
              -> Event cards

      -> End game Screen
