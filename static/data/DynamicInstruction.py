import sys

filename = sys.argv[1]
output = sys.argv[2]
dataset = []



with open(filename) as f:
    lines = f.readlines()
    
#remove the first row
att_row = lines.pop(0).strip('\n\r\t ')+',DI'
dataset.append(att_row)

dynamicInstructionNum = 0
for line in lines:
    item = line.strip('\n\t\r ').split(',')
    
    dataset.append(line.strip('\n\r\t ')+','+str(dynamicInstructionNum))
    
    if item[-1] == '61':
        dynamicInstructionNum += 1
    
    

savefile = open(output, 'w')

for item in dataset:
    print >> savefile, item
    
    
    
    
    
    
    
    
    
