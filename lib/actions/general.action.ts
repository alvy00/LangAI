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
    
    ## Evaluation Criteria

    Score the speaker from 0 to 100 in the categories below. Use strict logic and apply dynamic penalties/rewards as defined.
    
    ### 1. **Communication Skills**
    - ✅ Reward:
      - Clear organization, coherence, and logical flow of ideas.
      - Effective use of discourse markers, transitions, and structured elaboration.
      - Thoughtful, original, and detailed development of ideas.
    - ❌ Penalize:
      - Fragmented responses, disjointed or unclear organization.
      - Repetition of ideas without further development or elaboration.
      - Excessive use of fillers or weak speech, e.g., "like", "you know", "uh".

    ### 2. **Vocabulary & Grammar**
    - ✅ Reward:
      - Use of precise, rich, and topic-specific vocabulary.
      - Mastery of complex grammatical structures (e.g., conditionals, passive voice, modals, and complex sentence structures).
      - Variety in sentence structure, avoiding overuse of simple structures.
    - ❌ Penalize:
      - Frequent grammar errors that obscure meaning.
      - Overuse of basic sentence structures or simple words.
      - Awkward or incorrect word usage that detracts from clarity or meaning.

    ### 3. **Pronunciation & Clarity**
    - ✅ Reward:
      - Clear, articulate pronunciation and natural intonation.
      - Effective use of stress and rhythm to emphasize key points and create flow.
      - Varied pacing to maintain engagement and clarity.
    - ❌ Penalize:
      - Mispronunciations that hinder understanding.
      - Flat, robotic, or monotone speech patterns.
      - Lack of emphasis on important parts of the speech, making it sound unnatural.

    ### 4. **Confidence & Engagement**
    - ✅ Reward:
      - Demonstrated confidence in speaking, with elaboration and personal insight.
      - Natural conversational flow, including appropriate pauses for emphasis and reflection.
      - Engaged and thoughtful responses, showing active participation.
    - ❌ Penalize:
      - Extremely short answers (one-word or half-sentence responses).
      - Long, awkward pauses or hesitation, or ending the session prematurely.
      - Lack of engagement with the prompt or unwillingness to elaborate when asked.

    ### 5. **Comprehension & Responsiveness**
    - ✅ Reward:
      - Accurate, quick, and insightful responses to questions, demonstrating a deep understanding of the material.
      - Ability to build on the conversation and respond to prompts dynamically.
      - Showing an advanced level of comprehension and offering thoughtful, elaborated answers.
    - ❌ Penalize:
      - Misunderstanding or misinterpreting the question.
      - Drifting off-topic, giving incomplete or off-base responses.
      - Avoiding complex or challenging prompts without attempting to engage.

    ---
    
    ## Dynamic Bonuses & Penalties (Updated)

    ⬆️ **Bonuses (Max +7 points total)**:
    - Self-correction used effectively (+2).
    - Provided examples, analogies, or anecdotes (+2).
    - Clear signs of reflection or improvement throughout the session (+2).
    - Seamless transitions and linking ideas fluently (+1).

    ⬇️ **Penalties (Stricter and heavier)**:
    - Less than 3 full learner responses: **–20 points**.
    - Session under 1 minute (after removing silence): **–20 points**.
    - Speaker avoids multiple prompts or refuses harder ones: **–15 points**.
    - Robotic, flat, or disengaged tone: **–10 to –20 points**.
    - Short, one-word or two-word answers repeatedly: **–15 points**.
    - Long gaps or frequent "I don't know" without trying: **–10 points**.
    - Repeated requests to "skip" without attempt: **–5 to –10 points**.

    ---
    
    ## Output Required
    
    - Final **totalScore** (out of 100, adjusted with the logic above, and without rounding to multiples of 5).
    - A breakdown of **categoryScores** (e.g., Communication Skills: 85/100, Pronunciation & Clarity: 90/100).
    
    - **Strengths** (only if applicable):
      - If there are any notable strengths, provide at least 3 specific strengths, each tied to a transcript example. If none are identified, leave this section out, but include a light, positive message like:
        - "You did a great job overall! Keep practicing and you'll continue to improve. There were no major strengths identified, but don’t be discouraged, you’re on the right path."

    - **Areas for Improvement** (only if applicable):
      - A minimum of **3 areas for improvement**, each with actionable advice. If no areas for improvement are identified, leave this section out, but include a light, encouraging message like:
        - "No major areas for improvement identified at this time. Keep practicing and expanding your skills!"

    - A **finalAssessment** paragraph (3–5 sentences) summarizing the learner’s current level, tone, and potential trajectory.
    
    Be direct, evidence-based, and personalized in your evaluation. Do not be overly generous. High scores must be earned with complexity, effort, and fluency.
  `,
  system: "You are a certified English speaking examiner trained to assess advanced learners using international speaking standards. Provide structured, realistic, and actionable feedback.",
});


let dynamicScore = totalScore + (Math.random() * 2 - 1);
dynamicScore = Math.round(Math.max(0, Math.min(100, dynamicScore)));


const feedback = await db.collection('feedback').add({
  interviewId,
  userId,
  totalScore: dynamicScore,
  categoryScores,
  strengths,
  areasForImprovement,
  finalAssessment,
  createdAt: new Date().toISOString(),
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