def activeLearning(n, fault_injection_campaign, fault_injection_sites):
	# The init sample size is 0.005 * len(experiments)
	# Active learning will sample the rest of 0.005 * len(experiments) in 10 steps
	# The total number of sample is 0.01
	# Find the next subset sample.
	
	#pi = 1/Z * (1 – Si/S), where pi is the probability for instruction I and Si is the number of samples
	#used for creating the boundary at instruction i. S could be the total samples or the max number of 
	#samples at any instruction. Z is the normalization constant which is given by ∑ (1-Si/S) summing up
	#for all instructions. Now to pick the instruction probabilistically, you would do a cumulative density 
	#function (CDF) for your probability density function pi and pick the sample. Let me know if you want 
	#specifics about that part.
    pass
	


