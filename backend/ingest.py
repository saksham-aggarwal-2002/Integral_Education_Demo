import numpy as np
import pandas as pd
import re
import os
import uuid

from backend.database_access import get_engine

engine = get_engine()


def ingest_assessments(data_source):
    
    file_paths = []
    csv_files = [f for f in os.listdir(data_source) if f.endswith('.csv')]
    for csv_file in csv_files:
        file_paths.append(os.path.join(data_source, csv_file)) 
    
    for file_path in file_paths:
        df = pd.read_csv(file_path)

        #print(f"Processing {file_path} ...")

        #Assessment Metadata
        date_given = pd.to_datetime(df.iloc[0,4], format="%a, %d %b %Y %H:%M:%S %Z").date()
        text = df.iloc[0, 0]
        match = re.match(r'^(\w+)\s*[-–—]?\s*(\w+)', text)
        subject, assessment_name = match.groups()

        #Clean Dataframe
        df.columns = df.iloc[1, :]
        df.columns = df.columns.rename("")
        df = df.iloc[2:, :]
        questions_df_temp = df.iloc[:, 9:]
        questions_df_temp = questions_df_temp.mask(questions_df_temp == "-", np.nan).astype("int32", errors='ignore')

        df = pd.concat([df.iloc[:, :4], questions_df_temp], axis=1)
        df = df.reset_index(drop=True)

        #Create assessment dataframe
        assessment_id = str(uuid.uuid4())
        assessment_df = pd.DataFrame([{
                "assessment_id": assessment_id,
                "assessment_name": assessment_name,
                "subject": subject,
                "date_given": date_given
            }])
        
        #Create questions DataFrame
        questions_df = df.drop(columns=["Last Name", "Middle Name", "First Name", "Username"]).T
        questions_df['question_id'] = [str(uuid.uuid4()) for _ in range(len(questions_df))]
        questions_df['question_number'] = questions_df.index.astype(str).str.extract(r'(\d+)').astype(int).iloc[:, 0].to_list()
        questions_df['topic'] = np.random.choice(['LinAlg', 'Calc', 'Probability'], size=len(questions_df))
        questions_df['assessment_id'] = assessment_id
        questions_df['max_marks'] = 1
        questions_df = questions_df[['question_id', 'question_number', 'topic', 'assessment_id', 'max_marks']]
        questions_df.reset_index(drop=True, inplace=True)

        #Create responses_df DataFrame
        students_df = pd.read_sql("SELECT student_id, email FROM students", con=engine)
        responses_df = pd.merge(left=df , right=students_df, left_on='Username', right_on='email', how='left', validate="1:1")
        responses_df = responses_df.drop(columns=['Username', 'email', "Last Name", "Middle Name", "First Name"])
        responses_df = responses_df.T
        responses_df.columns = responses_df.iloc[-1]
        responses_df = responses_df.iloc[:-1].reset_index(drop=True)
        responses_df = pd.melt(responses_df,value_name="marks_obtained",var_name="student_id")
        n_of_questions = questions_df.shape[0]
        responses_df['question_number'] = list(range(1,n_of_questions+1)) * (len(responses_df) // n_of_questions)
        responses_df = pd.merge(left=responses_df, right=questions_df[['question_id', 'question_number']], on='question_number', how='left').drop(columns=['question_number'])
        responses_df['response_id'] = [str(uuid.uuid4()) for _ in range(len(responses_df))]


        #Write to postgres database
        assessment_df.to_sql("assessments", con=engine, if_exists='append', index=False)
        questions_df.to_sql("questions", con=engine, if_exists='append', index=False)
        responses_df.to_sql("responses", con=engine, if_exists='append', index=False)
        print(f"Done processing {file_path}")


def ingest_students(data_source):
    file_paths = []
    csv_files = [f for f in os.listdir(data_source) if f.endswith('.csv')]
    for csv_file in csv_files:
        file_paths.append(os.path.join(data_source, csv_file)) 
    
    

    for file_path in file_paths:
        #print(f"Processing {file_path} ...")
        df = pd.read_csv(file_path)
        #Clean Dataframe
        df.columns = df.iloc[1, :]
        df.columns = df.columns.rename("")
        df = df.iloc[2:, :]
        questions_df_temp = df.iloc[:, 9:]
        questions_df_temp = questions_df_temp.mask(questions_df_temp == "-", np.nan).astype("int32", errors='ignore')


        df = pd.concat([df.iloc[:, :4], questions_df_temp], axis=1)
        df = df.reset_index(drop=True)

        #Create new_students DataFrame
        current_students_df = df[["First Name", "Middle Name", "Last Name", "Username"]].rename(columns={
            'First Name': 'first_name',
            'Middle Name': 'middle_name',
            'Last Name': 'last_name',
            'Username': 'email'
        })

        known_students_df = pd.read_sql("SELECT student_id, email FROM students", con=engine)

        merged_df_ = current_students_df.merge(known_students_df, left_on='email', right_on='email', how='left')

        new_students_df = merged_df_[merged_df_["student_id"].isna()].reset_index(drop=True)

        new_students_df['student_id'] = [str(uuid.uuid4()) for _ in range(len(new_students_df))]

        new_students_df.to_sql('students', con=engine, if_exists='append', index=False)

        print(f"Done processing {file_path}")