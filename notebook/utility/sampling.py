import os
import numpy as np
import pandas as pd
import random
def activeSampling(n, fault_injection_campaign, fault_injection_sites):
	# Sampling method one:
	# The init sample size is 0.005 * len(experiments)
	# Active learning will sample the rest of 0.005 * len(experiments) in 10 steps
	# The total number of sample is 0.01
	# Find the next subset sample.

    pass

def adaptiveSampling(fault_injection_campaign, golden, path, bitsize=64, percentage=0.005, threshold=0.001):
    # Sample1
    # pi = 1/Z * (1 – Si/S), where pi is the probability for instruction I and Si is the number of samples
    # used for creating the boundary at instruction i. S could be the total samples or the max number of 
    # samples at any instruction. Z is the normalization constant which is given by ∑ (1-Si/S) summing up
    # for all instructions. Now to pick the instruction probabilistically, you would do a cumulative density 
    # function (CDF) for your probability density function pi and pick the sample. Let me know if you want 
    # specifics about that part.
    
    sample_size = int(len(fault_injection_campaign) * percentage)
    case = fault_injection_campaign.sample(n=sample_size, replace=True)
    case['diffnorm'] = case['diffnorm'].astype(float)
    golden_value = np.array(golden.value)

    # count the number of information use to construct the fault tolerance boundary
    fault_injection_sites_info_count = np.ones(len(golden))

    for index, row in case.iterrows():
        index = row['fileindex']

        # filter SDC case
        inject_error = abs(float(row['init_value']) - float(row['corrupt_value']))
        if inject_error > threshold:
            continue

        #if the propagation data does not exist
        masked_run_path = path+'/appstate_'+str(index) + '.log'
        if not os.path.isfile(masked_run_path):
            print("file does not exist")
            continue

        # if the error propagation exit early.
        masked_run = pd.read_csv(masked_run_path,  sep=" ", names=['linenum', 'variable', 'value'])
        masked_run = np.array(masked_run.value, dtype='float')
        #masked_run = np.fromfile(masked_run_path, dtype='double')

        if len(masked_run) < len(golden):
            print("odd!")
            continue

        propagation_error = golden_value - np.array(masked_run[0:len(golden_value)], dtype='double')

        # How to define whether a dynamic instruction is propagated by error. 
        # If the error is zero, and the initial value is also zero ignore the 
        # propagation element.
        count_array = propagation_error != 0
        fault_injection_sites_info_count += count_array

        count_array = ((propagation_error + golden_value) == 0)
        fault_injection_sites_info_count += count_array

        #for i in range(len(propagation_error)):
        #    if propagation_error[i] != 0:
        #        fault_injection_sites_info_count[i] += 1
            # Reduce the probability that inject error into variable with value is 0
        #    if propagation_error[i] == 0 and golden_value[i] == 0:
        #        fault_injection_sites_info_count[i] += 1
    
    fault_injection_sites_info_count = 1/fault_injection_sites_info_count
    fault_injection_sites_info_count = fault_injection_sites_info_count/float(np.sum(fault_injection_sites_info_count))
    #fault_injection_sites_info_count = -np.log(fault_injection_sites_info_count)

    #print(fault_injection_sites_info_count)
    #normalization = np.sum(fault_injection_sites_info_count)
    #prob_density = fault_injection_sites_info_count/normalization
    
    prob_density = fault_injection_sites_info_count
    
    test_cases = np.random.choice(len(golden), sample_size, p=prob_density)
    samples_index = []
    for item in test_cases:
        samples_index.append(item * bitsize + int(random.random() * bitsize))
    
    new_case = fault_injection_campaign.loc[samples_index,:]
    
    return pd.concat([case, new_case])
