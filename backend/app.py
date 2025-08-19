# app.py
from flask import Flask, render_template, redirect, url_for, request



#Import Feature BluePrints
from backend.dashboard1 import dashboard1_bp
from backend.dashboard2 import dashboard2_bp
from backend.dashboard3 import dashboard3_bp
from backend.automated_reporting import automated_reporting_bp
from backend.automated_marking import automated_marking_bp

#Create the Actual App
app = Flask(__name__, 
            static_folder="../frontend/static", 
            template_folder="../frontend/templates")


#Register Feature BluePrints
app.register_blueprint(dashboard1_bp)
app.register_blueprint(dashboard2_bp)
app.register_blueprint(dashboard3_bp)
app.register_blueprint(automated_reporting_bp)
app.register_blueprint(automated_marking_bp)



@app.route("/")
def home():
    return redirect(url_for('login'))


@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        return redirect(url_for('dashboard1.show_dashboard'))
    return render_template('login.html')


@app.route("/settings")
def settings():
    return render_template("settings.html")





