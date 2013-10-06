#!/usr/bin/env python

import time
"""import web"""
import nxt.locator
from nxt.motor import *

def spin_around(b):
  m_left = Motor(b, PORT_B)
  m_left.turn(100, 360)
  m_right = Motor(b, PORT_C)
  m_right.turn(-100, 360)

       
urls = (
    '/(.*)', 'hello'
)
"""app = web.application(urls, globals())"""
nxtmac = "00:16:53:11:3D:06"
b = nxt.locator.find_one_brick(debug=True,host=nxtmac,method=nxt.locator.Method(usb=True,bluetooth=False))
print b.get_device_info()[1]
"""spin_around(b)"""
#b.set_output_state([PORT_B]+[128, MODE_MOTOR_ON | MODE_REGULATED, REGULATION_MOTOR_SYNC,
#            self.turn_ratio, self.run_state, self.tacho_limit])
l = Motor(b, PORT_B)
r = Motor(b, PORT_C)
#l.run(64, True)
#r.run(127, True)
#time.sleep(10)
#l.idle()
#r.idle()
#l.brake()
#r.brake()

cmd = ""
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
r.brake()


class hello:        
    def GET(self, name):
        spin_around(b)
        if not name: 
            name = 'World'
        return 'Hello, ' + name + '!'

"""if __name__ == "__main__":
    app.run()
"""
