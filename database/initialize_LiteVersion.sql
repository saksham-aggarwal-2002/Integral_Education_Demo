PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS assessments;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
    student_id TEXT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessments (
    assessment_id TEXT PRIMARY KEY,
    assessment_name VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    date_given DATE
);

CREATE TABLE questions (
    question_id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL REFERENCES assessments(assessment_id),
    question_number INTEGER NOT NULL,
    topic VARCHAR(255),
    max_marks REAL NOT NULL,
    UNIQUE (assessment_id, question_number)
);

CREATE TABLE responses (
    response_id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(student_id),
    question_id TEXT NOT NULL REFERENCES questions(question_id),
    marks_obtained REAL,
    response_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, question_id)
);
