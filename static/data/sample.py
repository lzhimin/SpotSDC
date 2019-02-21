import numpy as np
import random
with open("fft_exhaust.csv") as f:
    lines = f.readlines()



sample = [lines[0].strip('\n\t\r ')]
size = 1000

#set random seed
#random.seed(3000)

for i in range(size):
    #line = lines[np.random.randint(1, len(lines))].strip('\n\t\r ')
    line = lines[random.randint(1, len(lines))].strip('\n\t\r ')
    item = line.split(',')
    
    #if int(item[-1]) > 42:
    sample.append(line)
    
savefile = open("fft_sample.csv", 'w')

for item in sample:
    print >> savefile, item