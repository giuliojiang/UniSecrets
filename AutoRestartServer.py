import time
import subprocess
import os

while True:
    subprocess.call([os.path.abspath(os.getcwd() + os.sep + 'StartServer')])
    print('Server crashed. Restarting in 5 seconds...')
    time.sleep(5)
