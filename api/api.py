from flask import Flask
import asyncio
import json
import mysql_getter
import sys
from flask_socketio import SocketIO
sys.path.append('/home/moritzjenny/chickenBot')
import servo_controller
import grove_button
import camera_controller

async def loop():
    while True:
        name = camera_controller.take_still()
        updateImage(name)
        await asyncio.sleep(60)




app = Flask(__name__)
socketio = SocketIO(app)

# Kickoff timer
#asyncio.run(loop())
# name = camera_controller.take_still()
# updateImage(name)


# Button
pin = 16
button = grove_button.GroveButton(pin)

def on_press(t):
	print('Button is pressed')
	servo_controller.turn()

def on_release(t):
	print("Button is released, pressed for {0} seconds".format(round(t, 6)))

button.on_press = on_press
button.on_release = on_release

socketio.run(app)

if __name__ == '__main__':
	socketio.run(app)




def get_time_table():
    with open("/home/moritzjenny/chickenBot/data/time_settings/timetable.json") as jsonFile:
        t = json.load(jsonFile)
        jsonFile.close()
        morning = t["morning"]
        evening = t["evening"]
        return morning, evening

def write_time_table_morning(newMorning):
    morning, evening = get_time_table()
    json_data = {
		"morning": newMorning,
		"evening": evening
	}

    with open('/home/moritzjenny/chickenBot/data/time_settings/timetable.json', 'w') as jsonFile:
        json.dump(json_data, jsonFile)
        jsonFile.close()

def write_time_table_evening(newEvening):
	morning, evening = get_time_table()

	json_data = {
		"morning": morning,
		"evening": newEvening
	}

	with open('/home/moritzjenny/chickenBot/data/time_settings/timetable.json', 'w') as jsonFile:
		json.dump(json_data, jsonFile)
		jsonFile.close()

@app.route('/data')
def get_data():

	# get from file
	"""
	f = open("/home/moritzjenny/chickenBot/data/temp_hum/temp.txt", "r")
	temp = f.readlines()[-1]
	f.close()
	f = open("/home/moritzjenny/chickenBot/data/temp_hum/hum.txt", "r")
	hum = f.readlines()[-1]
	f.close()
	return {'temp': temp, 'humi': hum}
	"""

	# get from db
	temp = mysql_getter.get_newest_temp()
	hum = mysql_getter.get_newest_humi()

	# get timetable
	morning, evening = get_time_table()

	return {'temp': temp, 'humi': hum, 'morning': morning, 'evening': evening}


@app.route('/triggerDoor')
def triggerDoorFromClient():
	servo_controller.turn()
	return {}


@socketio.on('connect')
def connected():
	print("Connected to client")

@socketio.on('disconnect')
def disconnected():
	print('Disconnected from client')

def updateImage(name):
	print('send new image name ...  ' + name)
	socketio.emit('updateImage', {'data': name})

def triggerDoorFromBackend():
	print('triggering door from client ... ')
	socketio.emit('triggerDoorResponse')


def finishedTurn(message):
	print('finished turning door from client ... ')
	socketio.emit('finishedDoorResponse', {'data': message})



