import sys

the_file = open(sys.argv[1], 'r')
inputbuff = the_file.read()
inputbuff = inputbuff.replace('\n', ' ')
print(inputbuff)
