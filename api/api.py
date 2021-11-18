from flask import Flask
import asyncio
import json
import mysql_getter
import sys
from flask_socketio import SocketIO
sys.path.append('/home/moritzjenny/chickenBot')
import grove_button
import servo_controller
import camera_controller
from apscheduler.schedulers.background import BackgroundScheduler
import time
from datetime import datetime
import configparser
import grove_led


# Load config
config = configparser.ConfigParser()
config.read('/home/moritzjenny/chickenBot.config')

imageInterval = int(config['camera']['imageInterval'])

# Button
pin = 16
button = grove_button.GroveButton(pin)

def check_chickenBot_status():
	#TODO: check everything.
	# If everything is ok -> then blink
	grove_led.set_to_true()

def on_press(t):
	print('Button is pressed')
	servo_controller.turn()

def on_release(t):
	print("Button is released, pressed for {0} seconds".format(round(t, 6)))


button.on_press = on_press
button.on_release = on_release


def takeStill():
	name = camera_controller.take_still()
	print('send new image name ...  ' + name)
	socketio.emit('updateImage', {'data': name})

def openDoorFromSchedule():
	status = mysql_getter.get_newest_door_status()
	if (str(status[1]) == "closed"):
		servo_controller.turn()

def closeDoorFromSchedule():
	status = mysql_getter.get_newest_door_status()
	if (str(status[1]) == "opened"):
		servo_controller.turn()

def updateSchedulers():
	global sched
	dayDate = time.strftime('%Y-%m-%d', time.localtime(time.time()))
	with open("/home/moritzjenny/chickenBot/data/time_settings/timetable.json") as jsonFile:
		t = json.load(jsonFile)
		jsonFile.close()
		morning = t["morning"]
		evening = t["evening"]
		if (morning is not None):
			sched.add_job(openDoorFromSchedule, 'interval', start_date=dayDate + " " + morning + ":00", hours=24, id='0')
		if (evening is not None):
			sched.add_job(closeDoorFromSchedule, 'interval', start_date=dayDate + " " + evening + ":00", hours=24, id='1')


app = Flask(__name__, static_folder="../build", static_url_path="/")
socketio = SocketIO(app)

print("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n"
	  "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n"
	  "%%%%%%%%%%%%%%%%%%%%%%%% Welcome to the %%%%%%%%%%%%%%%%%%%%%%%%%%\n"
	  "   _____ _    _ _____ _____ _  ________ _   _ ____   ____ _______ \n"
	  "  / ____| |  | |_   _/ ____| |/ /  ____| \ | |  _ \ / __ \__   __|\n"
	  " | |    | |__| | | || |    | ' /| |__  |  \| | |_) | |  | | | | \n"
	  " | |    |  __  | | || |    |  < |  __| | . ` |  _ <| |  | | | | \n"
	  " | |____| |  | |_| || |____| . \| |____| |\  | |_) | |__| | | | \n"
	  "  \_____|_|  |_|_____\_____|_|\_\______|_| \_|____/ \____/  |_| \n"
	  "                                                                  \n"
	  "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n"
	  "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n"
	  "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")

sched = BackgroundScheduler(daemon=True, timezone='Europe/Berlin')
updateSchedulers()
sched.start()

# Check Status of chickenBot
check_chickenBot_status()

# Kickoff camera timer
nowDate = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))

sched.add_job(takeStill, 'interval', start_date=nowDate, seconds=imageInterval, id='3')



if __name__ == '__main__':
	socketio.run(app)


@app.route('/')
def index():
		return app.send_static_file('index.html')


def get_time_table():
    with open("/home/moritzjenny/chickenBot/data/time_settings/timetable.json") as jsonFile:
        t = json.load(jsonFile)
        jsonFile.close()
        morning = t["morning"]
        evening = t["evening"]
        return morning, evening

def set_timne_table(morning, evening):
	with open("/home/moritzjenny/chickenBot/data/time_settings/timetable.json") as jsonFile:
		t = json.load(jsonFile)
		jsonFile.close()
		t["morning"] = morning
		t["evening"] = evening
		with open("/home/moritzjenny/chickenBot/data/time_settings/timetable.json", "w") as jsonFile:
			json.dump(t, jsonFile)
			jsonFile.close()

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

@app.route('/api/data')
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

	status = mysql_getter.get_newest_door_status()

	imageName = camera_controller.get_current_image_name()

	# get timetable
	morning, evening = get_time_table()

	return {'temp': temp, 'humi': hum, 'morning': morning, 'evening': evening, 'date' : str(status[0]), 'status': status[1], 'imageName': imageName}


@app.route('/api/triggerDoor')
def triggerDoorFromClient():
	print("triggered door")
	servo_controller.turn()
	return {}

@app.route('/api/getWeekData')
def getWeekData():
	print("requested week data")
	temp = mysql_getter.get_values_for_the_last_week("temperature")
	humi = mysql_getter.get_values_for_the_last_week("humidity")
	labels = mysql_getter.get_labels_for_the_last_week()
	return {'temp': temp, 'humi': humi, 'labels': labels}

@app.route('/api/getDayData')
def getDayData():
	print("requested day data")
	temp = mysql_getter.get_values_for_the_last_day("temperature")
	humi = mysql_getter.get_values_for_the_last_day("humidity")
	labels = mysql_getter.get_labels_for_the_last_day()
	return {'temp': temp, 'humi': humi, 'labels': labels}

def updateDoorHistory():
	status = mysql_getter.get_newest_door_status()
	socketio.emit('updateDoorHistory', {'date': str(status[0]), 'status': status[1]})


@socketio.on('connect')
def connected():
	print("Connected to client")

@socketio.on('disconnect')
def disconnected():
	print('Disconnected from client')



def triggerDoorFromBackend():
	print('triggering door from client ... ')
	socketio.emit('triggerDoorResponse')


def finishedTurn(message):
	print('finished turning door from client ... ')
	updateDoorHistory()
	socketio.emit('finishedDoorResponse', {'data': message})

@socketio.on("dateChange")
def handleDateChange(dateChange):
	print("change date ...")
	set_timne_table(dateChange["morningValue"], dateChange["eveningValue"])
	global sched
	sched.remove_job('0')
	sched.remove_job('1')
	updateSchedulers()
	return None






