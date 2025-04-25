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
  const { userId, limit=10 } = params;
  const Interviews = await db.collection('interviews').orderBy('createdAt', 'desc').where('finalized', '==', true).limit(limit).get();

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
You are a professional English coach helping someone improve their spoken English through a conversation practice session. Your goal is to evaluate their speaking based on clarity, fluency, vocabulary, grammar, and confidence.

Here is the transcript of the session:
\`\`\`
${formattedTranscript}
\`\`\`

Evaluate the speaker in the following areas with a score out of 100:
- **Communication Skills**: Clarity, fluency, and ability to articulate ideas clearly.
- **Vocabulary & Grammar**: Range of vocabulary and correct grammar usage.
- **Pronunciation & Clarity**: Accuracy and clarity of spoken words.
- **Confidence & Engagement**: How confidently and naturally the user speaks.
- **Comprehension & Responsiveness**: Ability to understand and respond appropriately to prompts.

Then provide:
- A brief **final assessment** (3–5 sentences).
- A list of **strengths** (at least 2).
- A list of **areas for improvement** (at least 2).

Be encouraging, but honest. Give specific examples when possible.
      `,
      system:
        "You are a professional English coach providing feedback on a user's spoken English. Analyze the transcript and give helpful, structured, and supportive feedback.",
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