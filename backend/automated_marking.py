from flask import Blueprint, render_template

automated_marking_bp = Blueprint('automated_marking', __name__)


@automated_marking_bp.route('/marking')
def mark():
    return render_template("automated_marking.html", show_sidebar=True)
