import sqlite3


#This is a one-time script to create and initialize the SQLite database. DO NOT RUN IT AGAIN.

#Creates and initializes a SQLite database
conn = sqlite3.connect('integral_education_database.db')
cursor = conn.cursor()



cursor.execute("PRAGMA foreign_keys = ON;")

with open("initialize_LiteVersion.sql", "r") as f:
    sql_script = f.read()

cursor.executescript(sql_script)

conn.commit()
conn.close()