import pandas as pd
import numpy as np
from numpy.polynomial.polynomial import polyfit
import matplotlib.pyplot as plt

%matplotlib inline

df_users = pd.read_csv(
  '2020-03-10_diss-v5-behavior_df-users-items_v5n48_users.csv'
)

df_items = pd.read_csv(
  '2020-03-10_diss-v5-behavior_df-users-items_v5n48.csv'
)

df_users = df_users.set_index(['prolificId'])
# the stuff later on breaks if I index df_items
#df_items = df_items.set_index(['prolificId', 'itemIndex'])

#df_users.head()
#df_items.head()

def scatter_plot(df, feature, target):
    plt.figure(figsize=(16, 8))
    plt.scatter(
        df[feature],
        df[target],
        c='black'
    )
    # b, m = polyfit(df[feature], df[target], 1)
    # print(b, m)
    # plt.plot(feature, b + m * feature, '-')
    plt.xlabel("{}".format(feature))
    plt.ylabel("strength of final belief R-G")
    plt.show()


"""
Calculate the number of switches
"""

# vertical in items; make it horizontal in users, for each user, one column for each item strategy
notNullBooleanSeries = df_items.assessmentStrategyOrder.notnull()
df_items_assessmentStrategies = df_items[notNullBooleanSeries]
df_stratsToColumns = df_items_assessmentStrategies.pivot(index='prolificId', columns='assessmentStrategyOrder', values='assessmentStrategy')
df_stratsToColumns = df_stratsToColumns.replace('restudy', 'R').replace('generate', 'G')

# create a string of strategy choices
df_stratsToColumns['assessmentStrategySequence'] = df_stratsToColumns.apply(
    lambda x: ''.join(x.dropna()),
    axis=1 # apply to each row
)

# process each string and create a new var: every switch from R->G or G->R is a switch
df_stratsToColumns['assessmentStrategySwitches'] = df_stratsToColumns['assessmentStrategySequence'].apply(
    lambda x: x.count('RG') + x.count('GR')
)

df_users = pd.concat([df_users, df_stratsToColumns], axis=1)

# check
# df_stratsToColumns[['assessmentStrategySequence','assessmentStrategySwitches']] 
# df_users[['assessmentStrategySequence','assessmentStrategySwitches']] 


"""
Create a string of strategy accuracies
"""
# vertical in items; make it horizontal in users, for each user, one column for each item accuracy
df_accuraciesToColumns = df_items_assessmentStrategies.pivot(index='prolificId', columns='assessmentStrategyOrder', values='assessmentStrategyAccuracy')
# create a string of strategy choices
df_accuraciesToColumns['assessmentAccuracySequence'] = df_accuraciesToColumns.apply(
    lambda x: ''.join(x.dropna().astype(int).astype(str)),
    axis=1 # apply to each row
)

df_users = pd.concat([df_users, df_accuraciesToColumns], axis=1)

# check
# df_accuraciesToColumns['assessmentAccuracySequence']
# df_users[['assessmentAccuracySequence']] 

"""
two strings
split them into lists of characters
zip them into a list of lists
"""

df_users['assessmentStratAcc'] = df_users[['assessmentStrategySequence','assessmentAccuracySequence']].apply(
    lambda x: np.array(zip(
            list(str(x['assessmentStrategySequence'])), 
            list(str(x['assessmentAccuracySequence']))
            )) if pd.notnull(x['assessmentStrategySequence']) else x['assessmentStrategySequence'],
    axis=1 # apply to each row
)

# check
# df_users['assessmentStratAcc']




# number of generate-failures

# % of generates that were failures

"""
make sequence into dict?
{1: ['G', 1], 2: ['G', 0]...}
a list of lists?
[['G',1], ['G', 0]]
a list?
[G1, G0, R1, R0...]
probability next is an R given G-fail
"""




# how many generate/restudy
# number of switches
# number of generate failures


scatter_plot(df_users, "assessmentStrategyChoiceGenerateCount", "diff_assessmentBeliefRG_num")
scatter_plot(df_users, "assessmentStrategySwitches", "diff_assessmentBeliefRG_num")