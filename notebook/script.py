import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

exp = np.loadtxt('cg.approxiation1',  delimiter=',')
dataset = pd.DataFrame({"type":exp[:,0], "result":exp[:,1], "accuracy":exp[:,2]})
id = list(set(dataset['type']))
id.sort()
id = np.array(id)/41401.0
std =np.array(dataset.groupby(['type']).std()['result'])/41401.0
m = np.array(dataset.groupby(['type']).mean()['result'])/41401.0

plt.errorbar(id, m, std, fmt='-o', capsize=4)
plt.xscale('log')
plt.xlabel('sample size', fontsize=15)
plt.ylabel("predict the percentage of Masked sample", fontsize=15)
plt.title('Conjugate Gradient', fontsize=15)
plt.xticks(rotation=45)

plt.show()
