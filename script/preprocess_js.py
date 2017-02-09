import subprocess
import sys
import os
import json

def run_command_shell_proc(cmd):
    print('>>> {}'.format(cmd))
    return subprocess.Popen(['/bin/bash', '-c', cmd], stdout=subprocess.PIPE)

def run_command_shell(cmd):
    the_process = run_command_shell_proc(cmd)
    the_process.wait()

# UniSecrets/
exec_dir = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + os.sep + '..')

# UniSecrets/static
static_dir = os.path.abspath(exec_dir + os.sep + 'static')

# UniSecrets/tmp
tmp_dir = os.path.abspath(exec_dir + os.sep + 'tmp')

# UniSecrets/config
config_dir = os.path.abspath(exec_dir + os.sep + 'config')
config_file_path = os.path.abspath(config_dir + os.sep + 'server_config.json')
config_file = open(config_file_path, 'r')
config_obj = json.loads(config_file.read())
HTTPS_DEFINE = config_obj['use_ssl']

# Remove UniSecrets/tmp
subprocess.call(['rm', '-rf', tmp_dir])

# Copy UniSecrets/static to UniSecrets/tmp
subprocess.call(['cp', '-r', static_dir, tmp_dir])

# UniSecrets/tmp/js
js_dir = os.path.abspath(tmp_dir + os.sep + 'js')

# UniSecrets/include
include_dir = os.path.abspath(exec_dir + os.sep + 'include')

# UniSecrets/config
config_dir = os.path.abspath(exec_dir + os.sep + 'config')

# for each js file, preprocess
for filename in os.listdir(js_dir):
    full_filename = os.path.abspath(js_dir + os.sep + filename)
    stem, ext = os.path.splitext(full_filename)
    if ext == '.js':
        print('Processing {}'.format(full_filename))
        # Rename into .js.pre
        temporary_filename = full_filename + '.pre'
        subprocess.call(['mv', full_filename, temporary_filename])
        # preprocess
        cmd = []
        cmd.append('cpp')
        # -P: Not to print line numbers.
        cmd.append('-P')
        # -I: Include directory.
        cmd.append('-I' + include_dir)
        cmd.append('-I' + config_dir)
        # -D: sets a define flag.
        if HTTPS_DEFINE:
            cmd.append('-DHTTPS')
        cmd.append(temporary_filename)
        subprocess.call(cmd, stdout=(open(full_filename, 'w')))
        # remove temporary
        subprocess.call(['rm', temporary_filename])
