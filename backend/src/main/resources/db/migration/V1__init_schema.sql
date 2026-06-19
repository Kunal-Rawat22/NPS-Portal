CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE business_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    head_user_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    google_sub VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE',
    business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL,
    reporting_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
    hrbp_id UUID REFERENCES users(id) ON DELETE SET NULL,
    competency VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE business_units
    ADD CONSTRAINT fk_bu_head FOREIGN KEY (head_user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    question_text TEXT NOT NULL,
    question_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    submitted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(survey_id, user_id)
);

CREATE TABLE question_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES survey_questions(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(survey_response_id, question_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_bu ON users(business_unit_id);
CREATE INDEX idx_users_hrbp ON users(hrbp_id);
CREATE INDEX idx_users_reporting_to ON users(reporting_to_id);
CREATE INDEX idx_survey_questions_survey ON survey_questions(survey_id);
CREATE INDEX idx_survey_questions_category ON survey_questions(category_id);
CREATE INDEX idx_survey_responses_survey_user ON survey_responses(survey_id, user_id);
CREATE INDEX idx_question_responses_sr ON question_responses(survey_response_id);
