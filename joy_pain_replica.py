import requests
import json
import urllib2
import time
import os
from apscheduler.schedulers.background import BackgroundScheduler

def joypain_backup():

    jp_service_replica = "http://services.arcgis.com/8df8p0NlLFEShl0r/ArcGIS/rest/services/Joy_Pain_Service/FeatureServer/createReplica"
    jpdata = {
	    "replicaName" : "joy_pain_300pm",
	    "layers" : ["0", "1"],
	    "returnAttachments" : "true",
	    "returnAttachmentsDataByURL" : "true",
	    "async": "false",
	    "syncModel" : "none",
	    "dataFormat": "json",
	    "f" : "json"
    }
    req1 = requests.post(jp_service_replica, data=jpdata)
    json_data = json.loads(req1.text)
    json_url = json_data['URL']
    req2 = urllib2.Request(json_url)
    response = urllib2.urlopen(req2)
    newpath = r"C:/Users/koeni129/Desktop/joypain_post_requests/" + time.strftime("%Y") + "/" + time.strftime("%m") + "/" + time.strftime("%d")
    if not os.path.exists(newpath):
    	os.makedirs(newpath)
    newfile = open(newpath + "/" + time.strftime("%H") + ".json", "w")
    newfile.write(response.read())
    newfile.close()

if __name__ == '__main__':
	scheduler = BackgroundScheduler()
	scheduler.add_job(joypain_backup, 'interval', minutes=60)
	scheduler.start()
	print('Press Ctrl+{0} to exit'.format('X'))

	try:
		while True:
			time.sleep(2)
	except (KeyboardInterrupt, SystemExit):
		scheduler.shutdown()
