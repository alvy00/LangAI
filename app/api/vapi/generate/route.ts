/* eslint-disable @typescript-eslint/no-unused-vars */
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { db } from '@/firebase/admin';

export async function GET() {
  return Response.json({ success: true, data: 'Thank you!' }, { status: 200 });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin") || "*";
  const { type, level, amount, userid } = await request.json();  // Add 'type' here

  try {
    const { text: questions } = await generateText({
      model: google('gemini-2.0-flash-001'),
      prompt: `
        Prepare questions for an English language trainer.
        The learner's proficiency level is ${level}.
        The amount of questions required is: ${amount}.
        The session type is: ${type}.  // Include session type in the prompt
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant, so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        Thank you! <3
      `
    });

    const interview = {
      type,  // Add the session type to the interview object
      level,
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      createdAt: new Date().toISOString()
    };

    await db.collection('interviews').add(interview);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, error: e }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
