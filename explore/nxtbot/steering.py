#!/usr/bin/env python

import socket
import json
import nxt.locator
from nxt.motor import *
import math

def steeringToMotors(power, angle):
	if angle < -math.pi:
		left, right = -1, -1
	elif angle < -math.pi / 2:
		left, right = -1, 4 / math.pi * angle + 3
	elif angle < 0:
		left, right = 4 / math.pi * angle + 1, 1
	elif angle < math.pi / 2:
		left, right = 1, -4 / math.pi * angle + 1
	elif angle < math.pi:
		left, right = -4 / math.pi * angle + 3, -1
	else:
		left, right = -1, -1
	return math.floor(left * power * 127), math.floor(right * power * 127)

nxtmac = "00:16:53:11:3D:06"
b = nxt.locator.find_one_brick(debug=True,host=nxtmac,method=nxt.locator.Method(usb=True,bluetooth=False))
print b.get_device_info()[1]

l = Motor(b, PORT_B)
r = Motor(b, PORT_C)

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(("192.168.0.106", 8080))

while True:
	data, addr = sock.recvfrom(1024)
	s = json.loads(data)
	power = s[u"power"]
	angle = s[u"angle"]
	print "power: " + str(power) + ", angle: " + str(angle)
	left, right = steeringToMotors(power, angle)
	print "left: " + str(left) + ", right: " + str(right)
    l.run(left, True)
    r.run(right, True)

"""cmd = ""
while (cmd != "q"):
  if (cmd == "f"):
    l.run(127, True)
    r.run(127, True)
  elif (cmd == "r"):
    l.run(-127, True)
    r.run(127, True)
  elif (cmd == "l"):
    l.run(127, True)
    r.run(-127, True)
  elif (cmd == "b"):
    l.brake()
    r.brake()
  elif (cmd == "i"):
    l.idle()
    r.idle()
  #elif (cmd == "q"):
  #  print "quit"
  else:
    print "unknown"
  cmd = raw_input("> ")
l.brake()
r.brake()"""
