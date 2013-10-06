#!/usr/bin/env python

import web
import json

urls = (
	"/(.*)", "steering"
)

app = web.application(urls, globals())

class steering:
	def POST(self, data):
		print "got request"
		s = json.loads(web.data())
		power = s[u"power"]
		angle = s[u"angle"]
		print "power: " + str(power) + ", angle: " + str(angle)
		return "ok"

if __name__ == "__main__":
	app.run()


