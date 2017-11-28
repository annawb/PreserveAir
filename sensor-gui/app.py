# for api
from flask import Flask, render_template, send_from_directory, url_for
from flask_restful import reqparse, Resource, Api
import random

# for sensor data from 'http://www.home-automation-community.com/'
import os, sys, Adafruit_DHT, time
from datetime import datetime, date
from apscheduler.schedulers.background import BackgroundScheduler


app = Flask(__name__,  static_url_path='')
api = Api(app)

parser = reqparse.RequestParser()

parser.add_argument('t1', required=True, location='headers')
parser.add_argument('t2', required=True, location='headers')
parser.add_argument('t3', required=True, location='headers')
parser.add_argument('h1', required=True, location='headers')
parser.add_argument('h2', required=True, location='headers')
parser.add_argument('h3', required=True, location='headers')

# initialize values dictionary for sending to front-end
values = {
            't1': 20.5,
            't2': 21.5,
            't3': 22.5,
            'h1': 40.5,
            'h2': 41.5,
            'h3': 42.5
        }


# initialize sensor variables
sensor                       = Adafruit_DHT.AM2302 #DHT11/DHT22/AM2302
pin                          = 4
sensor_name                  = "living-room"
hist_temperature_file_path   = "sensor-values/temperature_" + sensor_name + "_log_" + str(date.today().year) + ".csv"
latest_temperature_file_path = "sensor-values/temperature_" + sensor_name + "_latest_value.csv"
hist_humidity_file_path      = "sensor-values/humidity_" + sensor_name + "_log_" + str(date.today().year) + ".csv"
latest_humidity_file_path    = "sensor-values/humidity_" + sensor_name + "_latest_value.csv"
csv_header_temperature       = "timestamp,temperature_in_celsius\n"
csv_header_humidity          = "timestamp,relative_humidity\n"
csv_entry_format             = "{:%Y-%m-%d %H:%M:%S},{:0.1f}\n"
sec_between_log_entries      = 60
latest_humidity              = 0.0
latest_temperature           = 0.0
latest_value_datetime        = None

def write_header(file_handle, csv_header):
  file_handle.write(csv_header)

def write_value(file_handle, datetime, value):
  line = csv_entry_format.format(datetime, value)
  file_handle.write(line)
  file_handle.flush()

def open_file_ensure_header(file_path, mode, csv_header):
  f = open(file_path, mode, os.O_NONBLOCK)
  if os.path.getsize(file_path) <= 0:
    write_header(f, csv_header)
  return f

def write_hist_value_callback():
  write_value(f_hist_temp, latest_value_datetime, latest_temperature)
  write_value(f_hist_hum, latest_value_datetime, latest_humidity)

def write_latest_value():
  with open_file_ensure_header(latest_temperature_file_path, 'w', csv_header_temperature) as f_latest_value:  #open and truncate
    write_value(f_latest_value, latest_value_datetime, latest_temperature)
  with open_file_ensure_header(latest_humidity_file_path, 'w', csv_header_humidity) as f_latest_value:  #open and truncate
    write_value(f_latest_value, latest_value_datetime, latest_humidity)

# define flask SensorData resource class with getters and setters
class SensorData(Resource):
    def get(self):
        
        # randomize for now
        for i in range(3):
            r1 = random.random() - 0.5
            r2 = random.random() - 0.5
            values['t'+str(i+1)] = values['t'+str(i+1)] + r1
            values['h'+str(i+1)] = values['h'+str(i+1)] + r2
        
        
        # TODO: REPLACE THIS PART WITH READING DATA FROM SENSORS
        
        return {
                't1': values['t1'],
                't2': values['t2'],
                't3': values['t3'],
                'h1': values['h1'],
                'h2': values['h2'],
                'h3': values['h3']
               }
    
    def put(self):
        # curl -XPUT -H 't1: 20' -H 't2: 20' -H 't3: 20' -H 'h1: 20' -H 'h2: 20' -H 'h3: 20' 'http://localhost:5000/sensor-data'
        args = parser.parse_args()
        values['t1'] = float(args['t1'])
        values['t2'] = float(args['t2'])
        values['t3'] = float(args['t3'])
        values['h1'] = float(args['h1'])
        values['h2'] = float(args['h2'])
        values['h3'] = float(args['h3'])
        return {'success': True}


# http://127.0.0.1:5000/sensor-data
api.add_resource(SensorData, '/sensor-data')

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('css', path)

@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory('assets', path)


if __name__ == '__main__':
    app.run(debug=True) # make sure to set degub=False for real thing!