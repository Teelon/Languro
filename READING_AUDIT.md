# Reading Section Audit Report

## Executive Summary
The Reading Section allows users to generate AI-powered stories based on their level and interests. While the core text generation works, the audio feature—critical for language learning—is currently non-functional because the backend pipeline it relies on does not exist.

## Findings

### 1. Functional Components  ✅
*   **Frontend**: The UI for listing reading lessons, generating new ones, and the `Reader` interface are built and functional.
*   **Text Generation**: The `ReadingGenerator` service successfully uses Gemini to create appropriate stories and saves them to the database.
*   **Data Model**: The `ReadingLesson` model is correctly designed to store text, audio keys, and timestamps.

### 2. Critical Issues ❌
*   **Missing Audio Pipeline**: The code in `src/lib/reading/generator.ts` explicitly skips audio generation with a comment: `// NOTE: Audio generation is handled by Airflow pipeline, not here.`
    *   **Audit Result**: Examination of the Airflow directory (`d:\Gemini Hackathon\Airflow\dags`) reveals that **no such pipeline exists**. There is only a `verb_audio_generation.py` DAG, which is specific to single-word conjugations.
*   **Consequence**: Users will see a "Play" button or audio interface, but it will be silent. The `audioKey` field in the database remains `null`.

### 3. Minor Issues ⚠️
*   **Vocabulary Selection**: Currently selects random verbs. It lacks logic to prioritize user's "weak" words (Spaced Repetition System integration).
*   **Alignment**: Without audio, there is no word-level alignment data, breaking the "karaoke" style reading experience.

## Recommendations

### Option A: Implement Real-Time Audio (Recommended) 🚀
Implement audio generation directly within the `GenerateReadingButton` workflow (via `ReadingGenerator`). 
*   **Pros**: Instant gratification (user gets story + audio immediately), no complex Airflow dependencies, simpler architecture for the hackathon.
*   **Cons**: Slightly longer wait time (~5-10s) during generation.

### Option B: Build Airflow DAG
Create a new `reading_audio_generation.py` DAG in Airflow.
*   **Pros**: Decoupled, better for handling massive scale.
*   **Cons**: Complexity, delay (user must wait for batch job), currently overkill for demo.

## Next Steps
1.  **Direct Fix**: Modify `src/lib/reading/generator.ts` to generate audio using Gemini immediately after generating the text.
2.  **Upload**: Use the existing S3/R2 client to upload the audio and save the key.
3.  **UI Update**: Ensure the UI handles the "generating audio" state if it takes a few extra seconds.
