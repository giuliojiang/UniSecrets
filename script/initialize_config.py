import os
import sys
import subprocess

# UniSecrets/
exec_dir = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + os.sep + '..')

# UniSecrets/config.template
template_dir = os.path.abspath(exec_dir + os.sep + 'config.template')

# UniSecrets/config
config_dir = os.path.abspath(exec_dir + os.sep + 'config')

# Create config directory if it doesn't exist
subprocess.call(['mkdir', config_dir])

for a_config in os.listdir(template_dir):
    corresponding_file = os.path.abspath(config_dir + os.sep + a_config)
    if not os.path.isfile(corresponding_file):
        # copy over from template
        template_file = os.path.abspath(template_dir + os.sep + a_config)
        subprocess.call(['cp', template_file, corresponding_file])
