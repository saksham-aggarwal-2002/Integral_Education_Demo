from flask import Blueprint, render_template

automated_reporting_bp = Blueprint('automated_reporting', __name__)


@automated_reporting_bp.route('/automated_reporting')
def create_exam_set():
    return render_template("automated_reporting.html",
                        show_sidebar=True)
