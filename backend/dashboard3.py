from flask import Blueprint, render_template, jsonify, request
import random
import datetime

dashboard3_bp = Blueprint('dashboard3', __name__)

# Generate fixed fake data for all students at module load
students = ["Alice", "Bob", "Charlie", "David", "Eve"]
subjects = ["Verbal Reasoning", "Reading Comprehension", "Numerical Reasoning", "Maths"]
dates = [(datetime.date.today() - datetime.timedelta(days=i*7)).isoformat() for i in range(12)]

all_scores = {}
for student in students:
    scores = {}
    random.seed(hash(student) % 10000)  # Consistent per student
    for subj in subjects:
        scores[subj] = [random.randint(60, 100) for _ in dates]
    all_scores[student] = scores



@dashboard3_bp.route('/dashboard3')
def show_dashboard():
    return render_template('dashboard3.html', show_sidebar=True, students=students)

@dashboard3_bp.route('/dashboard3/card5/api')
def card5_api():
    student = request.args.get('student', students[0])
    scores = all_scores.get(student, {subj: [0]*len(dates) for subj in subjects})
    return jsonify({
        "student": student,
        "subjects": subjects,
        "dates": dates,
        "scores": scores
    })

@dashboard3_bp.route('/dashboard3/card6/api')
def card6_api():
    student = request.args.get('student', students[0])
    scores = all_scores.get(student, {subj: [0]*len(dates) for subj in subjects})
    summary = {}
    for subj in subjects:
        subj_scores = scores.get(subj, [])
        avg = (sum(subj_scores) / len(subj_scores)) if subj_scores else 0
        summary[subj] = round(avg / 100, 2)  # Scale to [0, 1]
    return jsonify({
        "student": student,
        "subjects": subjects,
        "summary": summary
    })

@dashboard3_bp.route('/dashboard3/card7/api')
def card7_api():
    student = request.args.get('student', students[0])
    scores = all_scores.get(student, {subj: [0]*len(dates) for subj in subjects})
    all_values = []
    for subj_scores in scores.values():
        all_values.extend(subj_scores)
    overall = (sum(all_values) / len(all_values)) if all_values else 0
    overall_scaled = round(overall / 100, 3)  # Scale to [0, 1]
    return jsonify({
        "student": student,
        "overallAverage": overall_scaled
    })