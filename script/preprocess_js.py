import subprocess
import sys
import os

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
        subprocess.call(['cpp', '-P', '-I', include_dir, '-I', config_dir, temporary_filename, '-o', full_filename])
        # remove temporary
        subprocess.call(['rm', temporary_filename])
