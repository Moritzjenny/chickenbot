from flask import Flask


app = Flask(__name__)


@app.route('/data')
def get_temp_hum_data():
	f = open("/home/moritzjenny/chickenBot/data/temp_hum/temp.txt", "r")
	temp = f.readlines()[-1]
	f.close()
	f = open("/home/moritzjenny/chickenBot/data/temp_hum/hum.txt", "r")
	hum = f.readlines()[-1]
	f.close()
	return {'temp': temp, 'humi': hum}
