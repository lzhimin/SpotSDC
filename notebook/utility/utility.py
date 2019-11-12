# The fault injection campaign should be a complete dataset
def fault_tolerance_masked_boundary(fault_injection_campaign, golden_run, threshold=0.01):
	# Test whether the fault injection campaign is complete
	assert len(golden_run) * 64 == len(fault_injection_campaign)
	
	boundary = []
	sdc_cases = []
	
	for index, row in fault_injection_campaign.iterrows():	

		if row['diffnorm'] >= threshold:
			#sdc_cases.append()
		
		if index % 64 == 0 and index != 0:
			
	
	
	
# The fault injection campaign should be a complete dataset	
def fault_tolerance_SDC_boundary(fault_injection_campaign, golden_run, threshold=0.01):
	# Test whether the fault injection campaign is complete
	assert len(golden_run) * 64 == len(fault_injection_campaign)
	
	for index, row in fault_injection_campaign.iterrows():
		pass