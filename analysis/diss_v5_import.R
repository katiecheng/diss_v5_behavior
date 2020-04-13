dir_proj <- here::here()
dir_data <- fs::path(dir_proj, "data")

df_v5n48 = read_csv(fs::path(dir_data, "2020-03-10_diss-v5-behavior_df-users-items_v5n48.csv"), col_names=TRUE)
df_v5n48_users = read_csv(fs::path(dir_data, "2020-03-10_diss-v5-behavior_df-users-items_v5n48_users.csv"), col_names=TRUE)

# keep only approved
df_v5n48_users <- filter(df_v5n48_users, status=="APPROVED" & !is.na(effort)); nrow(df_v5n48_users)

# Create new dfs  # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

#TODO fix so no error; upon import, treating all text areas as factors instead of character vectors

v5FactCols_users <- c("prolificId",
                      #"overallBetterWorseSame",
                      #"noticedStrategy",
                      "effectivenessRestudy", 
                      "effortRestudy",
                      "effectivenessGenerate", 
                      "effortGenerate",
                      "chosenStrategy", 
                      "effort", 
                      "assessmentBelief", 
                      "directionOfChange", 
                      "changeRelativeToOutcome")

v5FactCols_items <- c("prolificId",
                      "effectivenessRestudy", 
                      "effortRestudy",
                      "effectivenessGenerate", 
                      "effortGenerate",
                      "chosenStrategy", 
                      "effort", 
                      "assessmentBelief", 
                      "directionOfChange", 
                      "changeRelativeToOutcome")

v5NumCols <- c("age",
               "reviewed_at_datetime",
               "effectivenessRestudy_num", 
               "effortRestudy_num",
               "effectivenessGenerate_num", 
               "effortGenerate_num",
               "diff_assessmentBeliefRG_num", 
               "effort_num",
               "directionOfChange_num", 
               "changeRelativeToOutcome_num")

df_v5n48_users[v5FactCols_users] <- lapply(df_v5n48_users[v5FactCols_users], factor)
df_v5n48_users[v5NumCols] <- lapply(df_v5n48_users[v5NumCols], as.numeric)
df_v5n48[v5FactCols_items] <- lapply(df_v5n48[v5FactCols_items], factor)
df_v5n48[v5NumCols] <- lapply(df_v5n48[v5NumCols], as.numeric)

# drop excluded  # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# calculate summary stats across group for exclusion

m_restudyScore_v5n48 <- mean(df_v5n48_users$interventionStrategyRestudyScoreRound1, na.rm=T); m_restudyScore_v5n48 # 8.9
s_restudyScore_v5n48 <- sd(df_v5n48_users$interventionStrategyRestudyScoreRound1, na.rm=T); s_restudyScore_v5n48 # 1.99

# drop at user level (restudyScore 3 SD below mean)
df_v5n48_users <- filter(df_v5n48_users, interventionStrategyRestudyScoreRound1 >= m_restudyScore_v5n48 - 3*s_restudyScore_v5n48); nrow(df_v5n48_users) # 47

# drop at item level
df_v5n48 <- filter(df_v5n48, prolificId %in% df_v5n48_users$prolificId); nrow(df_v5n48)/40
