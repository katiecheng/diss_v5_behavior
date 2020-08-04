import pandas as pd
import numpy as np
from numpy.polynomial.polynomial import polyfit
import matplotlib.pyplot as plt
#import math 


df_users = pd.read_csv(
  '/Users/katie/Desktop/diss_v5_behavior/data/2020-03-10_diss-v5-behavior_df-users-items_v5n48_users.csv'
)

df_items = pd.read_csv(
  '/Users/katie/Desktop/diss_v5_behavior/data/2020-03-10_diss-v5-behavior_df-users-items_v5n48.csv'
)

df_users = df_users.set_index(['prolificId'])
# the stuff later on breaks if I index df_items
#df_items = df_items.set_index(['prolificId', 'itemIndex'])


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
Probability next is an R given G-fail vs. G-success

make sequence into a list of lists
[['G', 1], ['G', 0], ...]

iterate through list
maintain counts:
# G0s
# followed by R
# followed by G
# no choice to follow
for each ['G', 0], if index is 19, no choice to follow, else if followed by R +=R, else +=G
"""
# two strings, split them into lists of characters, zip them into a list of lists
df_users['assessmentStratAcc'] = df_users[['assessmentStrategySequence','assessmentAccuracySequence']].apply(
    lambda x: np.array(zip(
            list(str(x['assessmentStrategySequence'])), 
            list(str(x['assessmentAccuracySequence']))
            )) if pd.notnull(x['assessmentStrategySequence']) else x['assessmentStrategySequence'],
    axis=1 # apply to each row
)
# check
# df_users['assessmentStratAcc']



"""
write a function that can calculate the probability of stay vs. switch for each cell
r1, r0, g1, g0
Doesn't count the last, since no choice to follow
"""

def helperFunc(stratAccList, strategy, accuracy):
    numStratAcc = 0
    numStratAcc_exclude20 = 0
    numStay = 0
    numSwitch = 0
    for i in range(20):
        if pd.isnull(np.array(stratAccList)).all():
            # had to do isnull instead of notnull, else breaks
            pass 
        else:
            if (stratAccList[i] == [strategy, accuracy]).all():
                if i < 19:
                    numStratAcc += 1
                    numStratAcc_exclude20 += 1
                    if stratAccList[i+1][0] == strategy:
                        numStay += 1
                    else:
                        numSwitch += 1
                else:
                    numStratAcc += 1
    if numStratAcc_exclude20 > 0:
        probStay = numStay / float(numStratAcc_exclude20)
        probSwitch = numSwitch / float(numStratAcc_exclude20)
    else:
        probStay = float("nan")
        probSwitch = float("nan")
    return (numStratAcc, probStay, probSwitch)


def calcProbabilityStaySwitch(df, strategy, accuracy):
    df_users['howMany_%s_%s' %(strategy, accuracy)], \
    df_users['probStay_after_%s_%s' %(strategy, accuracy)], \
    df_users['probSwitch_after_%s_%s' %(strategy, accuracy)] = \
    zip(*df_users['assessmentStratAcc'].map(lambda seq: helperFunc(seq, strategy, accuracy)))


calcProbabilityStaySwitch(df_users, "G", "0")
calcProbabilityStaySwitch(df_users, "R", "0")
calcProbabilityStaySwitch(df_users, "G", "1")
calcProbabilityStaySwitch(df_users, "R", "1")

# summarize across all participants
# df_users[['howMany_G_0', 'probStay_after_G_0', 'probSwitch_after_G_0',
#          'howMany_G_1', 'probStay_after_G_1', 'probSwitch_after_G_1',
#          'howMany_R_0', 'probStay_after_R_0', 'probSwitch_after_R_0', 
#          'howMany_R_1', 'probStay_after_R_1', 'probSwitch_after_R_1']].describe().transpose().to_csv(
#             '/Users/katie/Desktop/diss_v5_behavior/data/behavSeq_probabilityStaySwitch.csv')

# break it down by condition and REG outcome
# df_users[['condition', 'interventionOutcome', 
#          'howMany_G_0', 'probStay_after_G_0', 'probSwitch_after_G_0',
#          'howMany_G_1', 'probStay_after_G_1', 'probSwitch_after_G_1',
#          'howMany_R_0', 'probStay_after_R_0', 'probSwitch_after_R_0', 
#          'howMany_R_1', 'probStay_after_R_1', 'probSwitch_after_R_1']].groupby(
#             ['condition', 'interventionOutcome']).describe().transpose().to_csv(
#             '/Users/katie/Desktop/diss_v5_behavior/data/behavSeq_probabilityStaySwitch_grouped.csv')

"""
how many G0 expereinced by outcome_G belief_R vs.
how many G0 expereinced by outcome_G belief_G ?
"""
# df_users[['condition', 'interventionOutcome', 'assessmentBelief', 
#          'howMany_G_0', #'probStay_after_G_0', 'probSwitch_after_G_0',
#          'howMany_G_1', #'probStay_after_G_1', 'probSwitch_after_G_1',
#          'howMany_R_0', #'probStay_after_R_0', 'probSwitch_after_R_0', 
#          'howMany_R_1']].groupby( #'probStay_after_R_1', 'probSwitch_after_R_1']]
#             ['condition', 'interventionOutcome', 'assessmentBelief']).describe().transpose().to_csv(
#             '/Users/katie/Desktop/diss_v5_behavior/data/behavSeq_howManyStaySwitch_grouped.csv')



# overall, switching after G0 vs after G1
# by condition


# Frequencies
# how many generate/restudy
# number of switches
# number of generate-failures
# % of generates that were failures


#scatter_plot(df_users, "assessmentStrategyChoiceGenerateCount", "diff_assessmentBeliefRG_num")
#scatter_plot(df_users, "assessmentStrategySwitches", "diff_assessmentBeliefRG_num")