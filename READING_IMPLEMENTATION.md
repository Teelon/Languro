# Reading Audio Pipeline Implementation

## Overview
We have successfully implemented the Airflow pipeline for generating audio for reading lessons, as requested. This follows the batch processing pattern used for verb conjugations to optimize for cost and scale.

## Implementation Details

### 1. New Airflow DAG
**File**: `d:\Gemini Hackathon\Airflow\dags\reading_audio_generation.py`
*   **Schedule**: Runs every hour at minute 30 (offset from verb DAG).
*   **Batch Size**: 50 lessons per batch (conservative limit due to longer text).
*   **Model**: Uses Gemini 2.5 TTS (Zephyr voice).
*   **Workflow**:
    1.  Fetches `ReadingLesson` records where `<audioKey>` is NULL.
    2.  Builds JSONL batch request with full lesson content.
    3.  Submits batch job to Gemini API.
    4.  Polls for completion (up to 20 mins).
    5.  Downloads results.
    6.  Processes audio (validation, Opus conversion).
    7.  Uploads to R2 bucket: `readings/{lang_code}/{reading_id}.opus`.
    8.  Updates Postgres: Sets `audioKey` in `reading_lessons`.

### 2. Helper Updates
**File**: `d:\Gemini Hackathon\Airflow\dags\utils\verb_audio_helpers.py`
*   Updated `validate_audio_segment` to accept a `max_duration` parameter.
*   Default remains 30s (for verbs), but reading DAG overrides this to 300s (5 mins) to accommodate longer stories.

## Deployment
The DAG is ready to be picked up by the Airflow scheduler. No further code changes are needed on the Next.js frontend; it is already configured to read the `audioKey` and play the audio if present.

## Limitations
*   **Alignment**: Currently, word-level timestamps (alignment) are not generated in this batch process. The "Karaoke" mode in the Reader will play audio but not highlight words. This can be added in version 2 by requesting timestamps from the model if supported in batch, or using a separate aligner.
