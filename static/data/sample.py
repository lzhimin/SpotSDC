import numpy as np
with open('cg_complete.csv') as f:
    lines = f.readlines()



sample = [lines[0].strip('\n\t\r ')]

size = 10000

for i in range(size):
    line = lines[np.random.randint(1, len(lines))].strip('\n\t\r ')
    
    item = line.split(',')
    
    #if int(item[-1]) > 42:
    sample.append(line)
    
savefile = open('cg_sample.csv', 'w')

for item in sample:
    print >> savefile, item