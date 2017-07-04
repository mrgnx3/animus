from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('my_event')
def test_message(message):
    app.logger.info("my_event has been triggered".format(message))
    emit('my_response', {'data': 'got it!'})


if __name__ == '__main__':
    socketio.run(app)
