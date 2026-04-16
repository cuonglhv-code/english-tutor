-- ────────────────────────────────────────────────────────────────────────────
-- 016_feedback_learning_schema.sql
-- Adds prompt versioning, evaluation traces, user feedback on AI,
-- and expert review tables for the feedback-learning system.
-- Run via: Supabase Dashboard → SQL Editor
-- ────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════
-- PROMPT VERSIONS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS prompt_versions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    version_number  INTEGER     NOT NULL,
    name            TEXT       NOT NULL,
    system_prompt   TEXT        NOT NULL,
    user_prompt_template TEXT,
    model_version   TEXT        DEFAULT 'claude-3-5-sonnet-20241022',
    is_active      BOOLEAN     DEFAULT false,
    changelog      TEXT,
    created_by     UUID        REFERENCES auth.users(id),
    created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;

-- Everyone can read prompt versions (to know which version scored their essay)
CREATE POLICY "Anyone can read prompt versions"
    ON prompt_versions FOR SELECT
    USING (true);

-- Only service role can insert/update (admin operations)
CREATE POLICY "Service role can manage prompt versions"
    ON prompt_versions FOR ALL
    USING (true);

-- Index for finding active prompt
CREATE INDEX IF NOT EXISTS idx_prompt_versions_active
    ON prompt_versions(is_active DESC, created_at DESC)
    WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════════
-- AI EVALUATIONS (Trace)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ai_evaluations (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Link to prompt version used
    prompt_version_id   UUID        REFERENCES prompt_versions(id) ON DELETE SET NULL,
    
    -- Link to submission (optional - for essays not saved as full submission)
    submission_id      UUID        REFERENCES essay_submissions(id) ON DELETE SET NULL,
    
    -- Raw AI response for debugging
    raw_ai_response   JSONB,
    
    -- Parsed result (same shape as feedback_results.feedback_json)
    parsed_result     JSONB,
    
    -- Tokens and latency
    tokens_input     INTEGER,
    tokens_output   INTEGER,
    latency_ms     INTEGER,
    
    -- Scoring metadata
    scoring_method  TEXT        DEFAULT 'ai_examiner',
    model_version  TEXT,
    
    -- Status for review workflow
    status          TEXT        DEFAULT 'completed',
    CHECK (status IN ('completed', 'under_review', 'flagged', 'resolved')),
    
    created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_evaluations ENABLE ROW LEVEL SECURITY;

-- Users can read their own evaluations
CREATE POLICY "Users can read own evaluations"
    ON ai_evaluations FOR SELECT
    USING (
        submission_id IS NULL OR
        EXISTS (
            SELECT 1 FROM essay_submissions es
            WHERE es.id = ai_evaluations.submission_id
            AND es.user_id = auth.uid()
        )
    );

-- Service role can manage all
CREATE POLICY "Service role can manage evaluations"
    ON ai_evaluations FOR ALL
    USING (true);

-- Index for joining with submissions
CREATE INDEX IF NOT EXISTS idx_ai_evaluations_submission
    ON ai_evaluations(submission_id DESC, created_at DESC);

-- Index for prompt version analysis
CREATE INDEX IF NOT EXISTS idx_ai_evaluations_prompt
    ON ai_evaluations(prompt_version_id DESC, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- USER AI FEEDBACK
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_ai_feedback (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id   UUID        REFERENCES ai_evaluations(id) ON DELETE CASCADE,
    user_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Rating: 1 = very poor, 5 = excellent
    rating        INTEGER     NOT NULL,
    CHECK (rating >= 1 AND rating <= 5),
    
    -- Quick feedback
    helpful       BOOLEAN,
    
    -- Optional free-text issues
    issues        TEXT,
    
    created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_ai_feedback ENABLE ROW LEVEL SECURITY;

-- Users can read their own feedback
CREATE POLICY "Users can read own feedback"
    ON user_ai_feedback FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback"
    ON user_ai_feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback (only within 24 hours)
CREATE POLICY "Users can update own feedback"
    ON user_ai_feedback FOR UPDATE
    USING (
        auth.uid() = user_id
        AND created_at > NOW() - INTERVAL '24 hours'
    );

-- Service role can read all (for aggregation)
CREATE POLICY "Service role can read all feedback"
    ON user_ai_feedback FOR SELECT
    USING (true);

-- Index for evaluation lookups
CREATE INDEX IF NOT EXISTS idx_user_ai_feedback_evaluation
    ON user_ai_feedback(evaluation_id DESC);

-- ═══════════════════════════════════════════════════════════════
-- EXPERT REVIEWS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS expert_reviews (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id  UUID        REFERENCES ai_evaluations(id) ON DELETE CASCADE,
    reviewer_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Original scores from AI
    original_task_achievement_band   NUMERIC(3,1),
    original_coherence_band       NUMERIC(3,1),
    original_lexical_band        NUMERIC(3,1),
    original_grammatical_band  NUMERIC(3,1),
    original_overall_band     NUMERIC(3,1),
    
    -- Revised scores (null = no change)
    revised_task_achievement_band   NUMERIC(3,1),
    revised_coherence_band       NUMERIC(3,1),
    revised_lexical_band        NUMERIC(3,1),
    revised_grammatical_band  NUMERIC(3,1),
    revised_overall_band     NUMERIC(3,1),
    
    -- Review metadata
    review_type     TEXT        DEFAULT 'correction',
    CHECK (review_type IN ('correction', 'regrading', 'comment')),
    
    notes          TEXT,
    
    -- Status
    status         TEXT        DEFAULT 'pending',
    CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
    
    created_at     TIMESTAMPTZ DEFAULT now(),
    resolved_at   TIMESTAMPTZ
);

ALTER TABLE expert_reviews ENABLE ROW LEVEL SECURITY;

-- Users can read their own reviews (if any)
CREATE POLICY "Users can read own reviews"
    ON expert_reviews FOR SELECT
    USING (auth.uid() = reviewer_id);

-- Service role can manage all reviews
CREATE POLICY "Service role can manage reviews"
    ON expert_reviews FOR ALL
    USING (true);

-- Index for evaluation lookups
CREATE INDEX IF NOT EXISTS idx_expert_reviews_evaluation
    ON expert_reviews(evaluation_id DESC, created_at DESC);

-- Index for pending reviews queue
CREATE INDEX IF NOT EXISTS idx_expert_reviews_pending
    ON expert_reviews(status ASC, created_at DESC)
    WHERE status = 'pending';

-- ═══════════════════════════════════════════════════════════════
-- INSERT INITIAL PROMPT VERSION (v1)
-- Note: The actual system_prompt will be populated by the app
-- when first analyzing an essay. This is a placeholder.
-- ═══════════════════════════════════════════════════════════════
INSERT INTO prompt_versions (
    version_number,
    name,
    system_prompt,
    model_version,
    is_active,
    changelog
)
VALUES (
    1,
    'Initial v1 (May 2023 Descriptors)',
    '[TO BE POPULATED BY APP]',
    'claude-3-5-sonnet-20241022',
    true,
    'Initial version based on May 2023 band descriptors'
);