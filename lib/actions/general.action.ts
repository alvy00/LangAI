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
      You are an advanced English language evaluator, assessing a learner's spoken English based on a transcript of their session. Your feedback should simulate a tough but fair speaking examiner from IELTS or TOEFL.
      
      Here is the session transcript:
      \`\`\`
      ${formattedTranscript}
      \`\`\`
      
      ---
      
      ## Evaluation Instructions:
      
      Give a score out of 100 for each of the following categories. Apply penalties and rewards based on the criteria below.
      
      ### 1. Communication Skills (Clarity & Fluency)
      - ✅ Reward:
        - Logical and structured answers.
        - Clear progression of ideas.
        - Use of discourse markers (e.g., "Firstly", "To summarize").
      - ❌ Penalize:
        - Fragmented sentences.
        - Repeating same idea multiple times with no clarity.
      
      ### 2. Vocabulary & Grammar
      - ✅ Reward:
        - Use of topic-specific vocabulary.
        - Appropriate use of idioms, collocations, or phrasal verbs.
        - Complex sentence structures.
      - ❌ Penalize:
        - Repetition of basic vocabulary.
        - Grammar errors that change meaning.
        - Overuse of simple tenses.
      
      ### 3. Pronunciation & Clarity
      - ✅ Reward:
        - Proper stress, rhythm, and intonation.
        - Pronouncing difficult or uncommon words correctly.
      - ❌ Penalize:
        - Mispronunciations that impair understanding.
        - Flat or robotic tone throughout.
      
      ### 4. Confidence & Engagement
      - ✅ Reward:
        - Willingness to elaborate or take initiative in the conversation.
        - Asking clarifying questions naturally.
      - ❌ Penalize:
        - One-word answers.
        - Abrupt silence or session ending without effort to continue.
      
      ### 5. Comprehension & Responsiveness
      - ✅ Reward:
        - Quick and accurate responses to prompts.
        - Building on previous points.
      - ❌ Penalize:
        - Misinterpreting questions.
        - Going off-topic frequently.
        - Avoiding harder questions.
      
      ---
      
      ## Bonus Scoring
      - Give **extra credit** (up to +5 points total) for:
        - Self-correction used effectively.
        - Giving examples to support opinions.
        - Demonstrating growth or reflection during the session.
      
      ## Session Context Rules
      - If the session has fewer than 3 complete learner responses, automatically deduct **15 points** from total.
      - If total session time is under 1 minutes, deduct **10 points** for lack of engagement.
      - If speaker avoids multiple questions or fails to expand, deduct **5–10 points**.
      - If responses are expressive, show effort, and demonstrate thoughtfulness, **reward +10 points**.
      - Cap total bonus to 10 points max.
      
      ---
      
      ## Output:
      - Final total score (out of 100), adjusted by the above rules.
      - Category scores.
      - 3+ specific strengths based on transcript.
      - 3+ areas for improvement, with actionable suggestions.
      - A short 3–5 sentence final assessment that’s honest, constructive, and tailored to this learner.
      
      System: You are a strict but encouraging English speaking examiner. Score fairly and avoid giving high marks for incomplete or low-effort sessions.
        `
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