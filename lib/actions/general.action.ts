/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'

import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { Interview, GetLatestInterviewsParams, GetFeedbackByInterviewIdParams, CreateFeedbackParams, Feedback } from "@/types";

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null>{
  const Interviews = await db.collection('interviews').where('userId', '==', userId).orderBy('createdAt', 'desc').get();

  return Interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
  })) as Interview[];
}
export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null>{
  const { userId, limit=5 } = params;
  const Interviews = await db.collection('interviews')
                             .orderBy('createdAt', 'desc')
                             .where('finalized', '==', true)
                             .where("userId", "!=", userId)
                             .limit(limit).get();

  return Interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
  })) as Interview[];
}
export async function getInterviewById(id: string): Promise<Interview | null>{
  const Interview = await db.collection('interviews').doc(id).get();

  return Interview.data() as Interview | null;
}


export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript } = params;

  try {
    // Format transcript in clean markdown style
    const formattedTranscript = transcript
      .map(({ role, content }) => `- ${role}: ${content}`)
      .join('\n');

      const { object: { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } } = await generateObject({
        model: google('gemini-2.0-flash-001', {
          structuredOutputs: false,
        }),
        schema: feedbackSchema,
        prompt: `
      You are a highly experienced English proficiency evaluator trained to simulate real-world speaking assessments like IELTS Band 9 or TOEFL. You are reviewing a conversation-based practice session transcript to provide an in-depth, honest evaluation. Base your scoring on international CEFR standards (B2–C2 range) and academic-level communication expectations.
      
      Here is the session transcript:
      \`\`\`
      ${formattedTranscript}
      \`\`\`
      
      ---
      
      ## Evaluation Criteria
      
      Score the speaker from 0 to 100 in the categories below. Use strict logic and apply dynamic penalties/rewards as defined.
      
      ### 1. **Communication Skills**
      - ✅ Reward:
        - Clear organization and coherence of thoughts.
        - Use of discourse markers, transitions, and structured elaboration.
        - Thoughtful development of ideas.
      - ❌ Penalize:
        - Fragmented responses.
        - Repeating points with no progression.
        - Overuse of filler phrases (e.g., "like", "you know").
      
      ### 2. **Vocabulary & Grammar**
      - ✅ Reward:
        - Use of precise, topic-specific vocabulary.
        - Complex grammar used naturally (e.g., conditionals, passive voice, modals).
        - Variety in sentence structure.
      - ❌ Penalize:
        - Frequent grammar errors that obscure meaning.
        - Overuse of simple structures.
        - Incorrect or awkward word usage.
      
      ### 3. **Pronunciation & Clarity**
      - ✅ Reward:
        - Clear articulation, natural intonation, and varied pacing.
        - Use of stress and rhythm to emphasize key points.
      - ❌ Penalize:
        - Mispronunciations that cause confusion.
        - Flat or robotic speech pattern.
      
      ### 4. **Confidence & Engagement**
      - ✅ Reward:
        - Willingness to elaborate, ask questions, or share personal insight.
        - Natural flow and conversational tone.
      - ❌ Penalize:
        - One-word or short answers.
        - Long pauses, hesitations, or ending the session prematurely.
      
      ### 5. **Comprehension & Responsiveness**
      - ✅ Reward:
        - Accurate and quick responses to questions.
        - Deep understanding of prompts and ability to build on them.
      - ❌ Penalize:
        - Misinterpreting questions.
        - Frequently drifting off-topic or avoiding complex prompts.
      
      ---
      
      ## Dynamic Bonuses & Penalties
      
      Apply the following based on session quality:
      
      - ⬆️ **Bonuses (Max +10 points total)**:
        - Self-correction used effectively (+2).
        - Provided examples, analogies, or anecdotes (+2).
        - Clear signs of reflection or improvement throughout the session (+3).
        - Seamless transitions and linking ideas fluently (+3).
      
      - ⬇️ **Penalties**:
        - Less than 3 full learner responses: –15 points.
        - Session under 1 minute: –10 points.
        - Speaker avoids multiple prompts or doesn't attempt harder ones: –10 points.
        - Robotic or disengaged delivery: –5 to –10 points.
        - Repeatedly requesting to "skip" or failing to elaborate: –5 points.
      
      ---
      
      ## Output Required
      
      - Final **totalScore** (out of 100, adjusted with the logic above).
      - A breakdown of **categoryScores**.
      - A minimum of 3 specific **strengths**, each tied to a transcript example.
      - A minimum of 3 **areas for improvement**, each with actionable advice.
      - A **finalAssessment** paragraph (3–5 sentences) summarizing the learner’s current level, tone, and potential trajectory.
      
      Be direct, evidence-based, and personalized in your evaluation. Do not be overly generous. High scores must be earned with complexity, effort, and fluency.
      `,
        system:
          "You are a certified English speaking examiner trained to assess advanced learners using international speaking standards. Provide structured, realistic, and actionable feedback.",
      });
      
      

    const feedback = await db.collection('feedback').add({
      interviewId,
      userId,
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      feedbackId: feedback.id
    };

  } catch (e) {
    console.error("Error saving feedback", e);
    return { success: false };
  }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null>{
  const { interviewId, userId } = params;
  const feedback = await db.collection('feedback')
                           .where('interviewId', '==', interviewId)
                           .where('userId', '==', userId)
                           .limit(1).get();
  

  if(feedback.empty) return null;

  const feedbackDoc = feedback.docs[0];
  return {
      id: feedbackDoc.id,
      ...feedbackDoc.data()
  } as Feedback;
}