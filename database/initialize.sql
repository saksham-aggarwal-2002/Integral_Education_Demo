-- This file initializes the database schema for the Integral Education system.

DROP TABLE IF EXISTS responses CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Students
CREATE TABLE students (
    student_id UUID PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessments
CREATE TABLE assessments (
    assessment_id UUID PRIMARY KEY,
    assessment_name VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    date_given DATE
);

-- Questions
CREATE TABLE questions (
    question_id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES assessments(assessment_id),
    question_number INTEGER NOT NULL,
    topic VARCHAR(255),
    max_marks DECIMAL(10,2) NOT NULL,
    UNIQUE (assessment_id, question_number)
);

-- Student Responses
CREATE TABLE responses (
    response_id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(student_id),
    question_id UUID NOT NULL REFERENCES questions(question_id),
    marks_obtained DECIMAL(10,2),
    response_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, question_id)
);
