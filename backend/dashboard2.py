from flask import Blueprint, render_template, jsonify, request

import pandas as pd
from backend.database_access import get_engine
engine = get_engine()



dashboard2_bp = Blueprint('dashboard2', __name__)


@dashboard2_bp.route('/dashboard2')
def show_dashboard():
    return render_template('dashboard2.html', show_sidebar=True)


@dashboard2_bp.route('/dashboard2/card1/api')
def card1_api():
    
    """
    #TEST DATA
    #Subjects per Exam Set
    subjects = ["Verbal Reasoning", "Reading Comprehension", "Numerical Reasoning", "Maths"]

    #Distributions of Exam Sets
    subject_distributions = {
        'Set A': [[0,25,30,50,90],[3,3,3,3,3],[55,70,80,90,98],[40,55,65,75,85]],
        'Set B': [[60,70,80,90,100],[50,65,75,85,95],[58,72,82,92,99],[45,60,70,80,88]],
        'Set C': [[55,68,78,88,96],[48,63,73,83,93],[52,68,78,88,97],[42,57,67,77,87]]
    }

    #Student performance on each exam
    students_marks = {
        'Set A': {
            "Alice": [78,85,92,70],
            "Bob": [65,75,80,60],
            "Charlie": [90,88,85,95]
        },
        'Set B': {
            "Alice": [82,90,95,75],
            "Bob": [70,78,85,65]
        },
        'Set C': {
            "Charlie": [88,92,90,85],
            "David": [60,70,75,55]
        }
    }
    """
    
    subjects = ["Verbal Reasoning", "Reading Comprehension", "Numerical Reasoning", "Maths"]


    students_df = pd.read_sql("SELECT * FROM students", con=engine)
    responses_df = pd.read_sql("SELECT * FROM responses", con=engine)
    questions_df = pd.read_sql("SELECT * FROM questions", con=engine)
    assessment_df = pd.read_sql("SELECT * FROM assessments", con=engine)

    #Change QR to NR --> temporary (need better solution here)
    assessment_df.loc[assessment_df['subject'] == 'QR', 'subject'] = 'NR'

    whole = responses_df.merge(questions_df, on=['question_id']).merge(assessment_df, on=['assessment_id']).merge(students_df, on=['student_id'])

    # Calculate total possible marks per assessment
    total_marks_df = questions_df.groupby('assessment_id')['max_marks'].sum().reset_index()
    total_marks_df = total_marks_df.rename(columns={'max_marks': 'total_marks'})

    # Calculate marks obtained per student per assessment
    student_marks = whole.groupby(['assessment_id', 'student_id']).agg({'marks_obtained': 'sum'}).reset_index()

    # Merge to get total possible marks for each assessment
    student_marks = student_marks.merge(total_marks_df, on='assessment_id', how='left')

    # Calculate percentage
    student_marks['percentage'] = (student_marks['marks_obtained'] / student_marks['total_marks']) * 100

    boxplots = student_marks.groupby(["assessment_id"]).agg(
        min_marks=('percentage', 'min'),
        q1=('percentage', lambda x: x.quantile(0.25)),
        median_marks=('percentage', 'median'),
        q3=('percentage', lambda x: x.quantile(0.75)),
        max_marks=('percentage', 'max')
    ).reset_index().merge(assessment_df[['assessment_id', 'assessment_name', "subject"]], on='assessment_id', how='left').drop(columns=['assessment_id']).round()


    subject_order = ["VR", "RC", "NR", "Maths"]

    subject_distributions = {}

    for assessment in boxplots['assessment_name'].unique():
        subset = boxplots[boxplots['assessment_name'] == assessment]
        # Reorder by subject_order
        stats_list = []
        for subj in subject_order:
            row = subset[subset['subject'] == subj]
            if not row.empty:
                stats = row[['min_marks', 'q1', 'median_marks', 'q3', 'max_marks']].values.tolist()[0]
                stats_list.append(stats)
            else:
                stats_list.append([])
        subject_distributions[assessment] = stats_list

    ########

    temp1 = student_marks.merge(assessment_df[['assessment_id', 'assessment_name', "subject"]], on='assessment_id', how='left').merge(students_df[['student_id', 'first_name', 'last_name']], on='student_id', how='left').round()
    temp1["name"] = temp1["first_name"] + " " + temp1["last_name"]
    temp1 = temp1.drop(columns=['assessment_id', 'student_id', "total_marks", "marks_obtained", "first_name", "last_name"])

    students_data = {}

    for assessment in temp1['assessment_name'].unique():
        subset = temp1[temp1['assessment_name'] == assessment]
        student_dict = {}
        for student in subset['name'].unique():
            marks_list = []
            for subj in subject_order:
                mark_row = subset[(subset['name'] == student) & (subset['subject'] == subj)]
                if not mark_row.empty:
                    marks_list.append(mark_row['percentage'].values[0])
                else:
                    marks_list.append(None)
            student_dict[student] = marks_list
        students_data[assessment] = student_dict


    

    return jsonify({
        "subjects": subjects,
        "subject_distributions": subject_distributions,
        "students_marks": students_data
    })



@dashboard2_bp.route('/dashboard2/card2/api')
def card2_api():
    import datetime
    import random

    subjects = ["Verbal Reasoning", "Reading Comprehension", "Numerical Reasoning", "Maths"]
    dates = [(datetime.date.today() - datetime.timedelta(days=i)).isoformat() for i in range(10)]

    boxplot_series = []
    median_series = {subj: [] for subj in subjects}

    for date in dates:
        stats = {}
        for i, subj in enumerate(subjects):
            base = 50 + i*2
            # Add random perturbations to each stat
            min_val = int(base + random.randint(-5, 5))
            q1_val = int(base + 10 + random.randint(-5, 5))
            median_val = int(base + 20 + random.randint(-5, 5))
            q3_val = int(base + 30 + random.randint(-5, 5))
            max_val = int(base + 40 + random.randint(-5, 5))
            box = [min_val, q1_val, median_val, q3_val, max_val]
            stats[subj] = box
            median_series[subj].append(median_val)
        boxplot_series.append({
            "date": date,
            "boxplots": stats
        })

    return jsonify({
        "subjects": subjects,
        "dates": dates,
        "boxplot_series": boxplot_series,
        "median_series": median_series
    })

@dashboard2_bp.route('/dashboard2/card3/api')
def card3_api():
    import random

    exams = ["Set A", "Set B", "Set C"]
    subjects = ["Verbal Reasoning", "Reading Comprehension", "Numerical Reasoning", "Maths"]
    bands = ["Superior", "Distinction", "Average", "Below Average"]

    # For each exam, for each subject, generate random band counts
    pie_data = {}
    for exam in exams:
        pie_data[exam] = {}
        for subj in subjects:
            # Random counts for each band, sum to 100
            counts = [random.randint(10, 40) for _ in bands]
            total = sum(counts)
            # Normalize to sum to 100
            counts = [int(c * 100 / total) for c in counts]
            # Adjust last band to ensure sum is 100
            counts[-1] = 100 - sum(counts[:-1])
            pie_data[exam][subj] = [{"name": band, "value": count} for band, count in zip(bands, counts)]

    return jsonify({
        "exams": exams,
        "subjects": subjects,
        "bands": bands,
        "pie_data": pie_data
    })

@dashboard2_bp.route('/dashboard2/card4/api')
def card4_api():
    import random

    exams = ["Set A", "Set B", "Set C"]
    subjects = ["Verbal Reasoning", "Reading Comprehension", "Numerical Reasoning", "Maths"]
    questions = [f"Q{i+1}" for i in range(50)]

    # For each exam, for each subject, generate random percentages for each question
    bar_data = {}
    for exam in exams:
        bar_data[exam] = {}
        for subj in subjects:
            bar_data[exam][subj] = []
            for q in questions:
                percent_correct = random.randint(40, 100)  # percent of students correct
                bar_data[exam][subj].append({"question": q, "percent_correct": percent_correct})

    return jsonify({
        "exams": exams,
        "subjects": subjects,
        "questions": questions,
        "bar_data": bar_data
    })