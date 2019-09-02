import numpy as np
import random
import pandas as pd
import math


def functionline(linenum):   
  if 20<=linenum  and linenum<=28:
    return 'matvec'
  elif 30<=linenum and linenum<=35:
    return 'waxpby'
  elif 37<=linenum and linenum<=42:
    return 'daxpby'
  elif 44<=linenum and linenum<=51:
    return 'dot_r2'
  elif 53<=linenum and linenum<=60:
    return 'dot'
  elif 62<=linenum and linenum<=101:
    return 'solve_cg'
  elif 162<=linenum and linenum<=170:
    return 'readA'
  elif 172<=linenum and linenum<=177:
    return 'readB'
  elif 179<=linenum and linenum<=184:
    return 'initX'
  else:
    raise Exception("unknonw line")
		
#1. file
#2. linenum
#3. variable
#4. byte_num
#5. corrupted
#6. init_value
#7. to
#8. corrupt_value
#9. mask
#10. byte
#11. expo
#12. ss
#13. op
#14. diffnorm
#15. empty

#========================================》
#File_index
#Function
#Line
#Variable
#out_xor
#out_xor_relative
#diffnormr
#outcome
#iter
#bit
#DI

result_data_set = []
		
experiment = pd.read_csv('../matrix/in27_data/in27/injectlog.log',  sep=' ', names=['file', 'linenum', 'variable','byte_num', 'corrupted','init_value','to', 'corrupt_value', 'mask', 'byte','expo', 'ss', 'op', 'diffnorm', 'empty'])

for index, row in experiment.iterrows():
	item = []
	#File_index
	item.append(index)
	#Function
	item.append(functionline(row["linenum"]))
	#Line
	item.append(row["linenum"])
	#Variable
	item.append(row["variable"])
	#out_xor
	item.append(float(row["corrupt_value"])-float(row["init_value"]))
	#out_xor_relative
	if row["init_value"] != 0:
		item.append(float(row["corrupt_value"])/float(row["init_value"]))
	else:
		item.append(0)
	#diffnormr
	diffnorm = float(row["diffnorm"])
	#outcome	
	if math.isnan(diffnorm):
		item.append("nan")
		item.append("Crash")
	elif math.isinf(diffnorm):
		item.append("inf")
		item.append("Crash")
	elif diffnorm < 0.07:
		item.append(diffnorm)
		item.append("Masked")
		
	elif diffnorm >= 0.07:
		item.append(diffnorm)
		item.append("SDC")
			
	else:
		raise Exception("unknown value for outcome")
	
	#iter
	item.append("0")
	
	#bit
	bit = 0
	byte = row['byte']
		
	while int(byte/10) != 0:
		bit += 4
		byte = byte/10
	
	if byte == 1:
		bit += 1
	elif byte == 2:
		bit += 2
	elif byte == 4:
		bit += 3
	elif byte == 8:
	    bit += 4		
	item.append(bit)

    #DI
	item.append(row["byte_num"].split("#")[1].strip(" \n\t"))
	#print(item)
	#print(item)
	#print(int(row["byte_num"].split("#")[1]))
	result_data_set.append(item)

result_data_set =  pd.DataFrame(result_data_set, columns=["File_index", "Function", "Line", "Variable", "out_xor", "out_xor_relative", "diffnormr", "outcome", "iter", "bit", "DI"])
result_data_set.to_csv("in27.csv", index = None)