from flask import Blueprint, render_template, jsonify, request

import pandas as pd
from backend.database_access import get_engine
engine = get_engine()

dashboard1_bp = Blueprint('dashboard1', __name__)

@dashboard1_bp.route('/dashboard1')
def show_dashboard():
    
    # students_df = pd.read_sql("SELECT * FROM students", con=engine)

    return render_template('dashboard1.html',
                           total_students=0,
                           total_exam_sets=0,
                           top_english_all=0,
                           bottom_english_all=0,
                           top_english_verbal=0,
                           bottom_english_verbal=0,
                           top_english_reading=0,
                           bottom_english_reading=0,
                           top_math_all=0,
                           bottom_math_all=0,
                           top_math_math=0,
                           bottom_math_math=0,
                           top_math_num=0,
                           bottom_math_num=0,
                           show_sidebar=True)

