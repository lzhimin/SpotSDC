import numpy as np
import random
import pandas as pd
import math


def remap_function_line(linenum):
 
	if linenum == 906:
		return [906, "InitA"]
	elif linenum == 955:
		return [955, "TouchA"]
	elif linenum == 711:
		return [711, "lu"]
	elif linenum == 590:
		return [590, "lu0"]
	elif linenum == 592:
		return [592, "lu0"]
	elif linenum == 660:
		return [660, "daxpy"]
	
	elif linenum == 729:
		return [729, "lu"]
	elif linenum == 745:
		return [745, "lu"]
	
	elif linenum == 610:
		return [610, "bdiv"]
	elif linenum == 629:
		return [629, "bmodd"]
	
	elif linenum == 627:
		return [627, "bmodd"]
	elif linenum == 796:
		return [796, "lu"]
		
	elif linenum == 812:
		return [812, "lu"]
	elif linenum == 814:
		return [814, "lu"]
		
	elif linenum == 647:
		return [647, "bmod"]
	elif linenum == 765:
		return [765, "lu"]
	else:
		print(linenum)
		raise Exception("Unknow Line and Function")

		
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
		
experiment = pd.read_csv("injectlog.log",  sep=' ', names=['file', 'linenum', 'variable','byte_num', 'corrupted','init_value','to', 'corrupt_value', 'mask', 'byte','expo', 'ss', 'op', 'diffnorm', 'empty'])

L = len(experiment)/10
for index, row in experiment.iterrows():
	item = []
	#File_index
	item.append(index)
	
	
	Line, function = remap_function_line(row["linenum"])
	
	#Function
	item.append(function)
	
	#Line
	item.append(Line)
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
	elif diffnorm <= 0.00001:
		item.append(diffnorm)
		item.append("Masked")
		
	elif diffnorm > 0.00001:
		item.append(diffnorm)
		item.append("SDC")
			
	else:
		raise Exception("unknown value for outcome")
	
	#iter
	item.append(math.floor(int(index)/L))
	
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
	result_data_set.append(item)

result_data_set =  pd.DataFrame(result_data_set, columns=["File_index", "Function", "Line", "Variable", "out_xor", "out_xor_relative", "diffnormr", "outcome","iter", "bit", "DI"])
result_data_set.to_csv("in10.csv", index = None)