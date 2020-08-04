
# Update variable types # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

df_v5n48_users$condition <- factor(df_v5n48_users$condition,
                                   levels=c(0,1),
                                   labels=c("control", "expt"))

df_v5n48$condition <- factor(df_v5n48$condition,
                             levels=c(0,1),
                             labels=c("control", "expt"))

# Create new variables # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# feedback type (none, equal, restudy, generate)

df_v5n48_users$feedback <- factor(ifelse(
  df_v5n48_users$condition=="control", "none",
  ifelse(df_v5n48_users$interventionOutcome=="equal", "equal",
         ifelse(df_v5n48_users$interventionOutcome=="restudy", "restudy", "generate"))))

df_v5n48$feedback <- factor(ifelse(
  df_v5n48$condition=="control", "none",
  ifelse(df_v5n48$interventionOutcome=="equal", "equal",
         ifelse(df_v5n48$interventionOutcome=="restudy", "restudy", "generate"))))

df_v5n48$assessmentStrategy_num <- factor(ifelse(
  df_v5n48$assessmentStrategy=="restudy", 0,
  ifelse(df_v5n48$assessmentStrategy=="generate", 1, NA)))

# calculate effort diff
df_v5n48_users$diff_assessmentBeliefEffortRG_num <- df_v5n48_users$effortRestudy_num - df_v5n48_users$effortGenerate_num


# which exceeded expectations more?
df_v5n48_users$diff_interventionStrategyScoreExceedPrediction <- df_v5n48_users$diff_interventionRestudyScoreToPrediction - 
  df_v5n48_users$diff_interventionGenerateScoreToPrediction

# scale predictions to be on the same scale as effectiveness ratings

scaling_constant <- 10/1.69

df_v5n48_users$changeBeliefRG_num <- df_v5n48_users$diff_assessmentBeliefRG_num - (df_v5n48_users$diff_interventionPredictRG * scaling_constant)

df_v5n48_users$diff_assessmentBeliefRG_scale10 <- df_v5n48_users$diff_assessmentBeliefRG_num * scaling_constant

# reorder variable levels

df_v5n48_users$interventionPrediction <- factor(df_v5n48_users$interventionPrediction, levels = c("generate", "equal", "restudy"))
df_v5n48_users$interventionOutcome <- factor(df_v5n48_users$interventionOutcome, levels = c("generate", "equal", "restudy"))
df_v5n48_users$assessmentBelief <- factor(df_v5n48_users$assessmentBelief, levels = c("generate", "equal", "restudy"))
df_v5n48_users$assessmentBehaviorREG <- factor(df_v5n48_users$assessmentBehaviorREG, levels = c("generate", "equal", "restudy"))

# REG to numeric
df_v5n48_users$interventionPrediction_num <- ifelse(df_v5n48_users$interventionPrediction =="generate", -1, 
                                                    ifelse(df_v5n48_users$interventionPrediction == "equal", 0, 
                                                           ifelse(df_v5n48_users$interventionPrediction == "restudy", 1, NA)))
df_v5n48_users$interventionOutcome_num <- ifelse(df_v5n48_users$interventionOutcome =="generate", -1, 
                                                 ifelse(df_v5n48_users$interventionOutcome == "equal", 0, 
                                                        ifelse(df_v5n48_users$interventionOutcome == "restudy", 1, NA)))
df_v5n48_users$assessmentBelief_num <- ifelse(df_v5n48_users$assessmentBelief =="generate", -1, 
                                              ifelse(df_v5n48_users$assessmentBelief == "equal", 0, 
                                                     ifelse(df_v5n48_users$assessmentBelief == "restudy", 1, NA)))

# change beliefs
df_v5n48_users$changeBeliefs <- df_v5n48_users$interventionPrediction != df_v5n48_users$assessmentBelief

# outcome measures
df_v5n48_users$finalMatchOutcome <- df_v5n48_users$interventionOutcome == df_v5n48_users$assessmentBelief
df_v5n48_users$finalMatchOutcome_num <- ifelse(df_v5n48_users$finalMatchOutcome, 1, 0)

df_v5n48_users$firstItemStrategyMatchOutcome  <- df_v5n48_users$interventionOutcome == df_v5n48_users$itemStrategy_1
df_v5n48_users$firstItemStrategyMatchOutcome_num  <- ifelse(df_v5n48_users$firstItemStrategyMatchOutcome, 1, 0)

df_v5n48_users$finalBehaviorMatchOutcome <- df_v5n48_users$interventionOutcome == df_v5n48_users$assessmentBehaviorREG
df_v5n48_users$finalBehaviorMatchOutcome_num <- ifelse(df_v5n48_users$finalBehaviorMatchOutcome, 1, 0)

# behavior diffRG
df_v5n48_users$diff_assessmentBehaviorRG <- df_v5n48_users$assessmentStrategyChoiceRestudyCount - df_v5n48_users$assessmentStrategyChoiceGenerateCount

# success rate
df_v5n48_users$assessmentStrategyRestudySuccessRate <- df_v5n48_users$assessmentStrategyRestudyScore / df_v5n48_users$assessmentStrategyChoiceRestudyCount
df_v5n48_users$assessmentStrategyGenerateSuccessRate <- df_v5n48_users$assessmentStrategyGenerateScore / df_v5n48_users$assessmentStrategyChoiceGenerateCount


# effort diffRG
df_v5n48_users$diff_effortRG  <- df_v5n48_users$effortRestudy_num - df_v5n48_users$effortGenerate_num

# diff test 2 to test 1
df_v5n48_users$changeTestScore <- df_v5n48_users$assessmentTestScore - df_v5n48_users$interventionTestScore

# drop unused factor levels
df_v5n48 <- droplevels(df_v5n48)
df_v5n48_users <- droplevels(df_v5n48_users)

# subset dfs
df_v5n48_users_control <- filter(df_v5n48_users, condition=="control"); nrow(df_v5n48_users_control)
df_v5n48_users_expt <- filter(df_v5n48_users, condition=="expt"); nrow(df_v5n48_users_expt)
df_v5n48_users_predRoutG <- filter(df_v5n48_users, interventionPrediction=="restudy" & interventionOutcome=="generate"); nrow(df_v5n48_users_predRoutG)

# create dataset for CPA in SPSS
df_v5n48_users_subCPA <- df_v5n48_users[c(
  "condition",                                     # experimental condition (categ: control, expt1, expt2)
  "age",
  "diff_interventionPredictRG",                    # predicted difference restudy-generate (cont: -10 to 10)
  "interventionPrediction",                        # prediction for best strategy (categ: restudy, equal, generate)\
  "diff_interventionTestOutcomeRG",                # actual difference restudy-generate (cont: -10 to 10)
  "interventionOutcome",                           # actual best strategy (categ: restudy, equal, generate)
  "interventionTestScore",                         # total score on intervention test
  "assessmentStrategyChoiceGenerateCount",         # DV: number of generate choices (cont: 0-20)
  "assessmentTestScore",                           # DV: final test score (cont: 0-20)
  "diff_assessmentBeliefRG_num",                   # DV: final belief for difference restudy-generate (cont: -1.69 to 1.69)
  "assessmentBelief"                               # DV: final belief for best strategy (categ: restudy, equal, generate)
)]
levels(df_v5n48_users_subCPA$condition) <- c(0,1)
levels(df_v5n48_users_subCPA$interventionPrediction) <- c(0,1,2)
levels(df_v5n48_users_subCPA$interventionOutcome) <- c(0,1,2)
levels(df_v5n48_users_subCPA$assessmentBelief) <- c(0,1,2)
df_v5n48_users_subCPA$diff_interventionPredictRG <- -1 * df_v5n48_users_subCPA$diff_interventionPredictRG
df_v5n48_users_subCPA$diff_interventionTestOutcomeRG <- -1 * df_v5n48_users_subCPA$diff_interventionTestOutcomeRG
df_v5n48_users_subCPA$diff_assessmentBeliefRG_num <- -1 * df_v5n48_users_subCPA$diff_assessmentBeliefRG_num
names(df_v5n48_users_subCPA) <- c("group01", "age", "predictN", "predictC", "outcomeN", "outcomeC", "quiz1", "numGen", "quiz2", "beliefN", "beliefC")
write.csv(df_v5n48_users_subCPA,fs::path(dir_data, "Katie_v5n48_CPA.csv"), row.names = FALSE)
