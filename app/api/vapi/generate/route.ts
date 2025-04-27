/* eslint-disable @typescript-eslint/no-unused-vars */
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { db } from '@/firebase/admin';

export async function GET() {
  return Response.json({ success: true, data: 'Thank you!' }, { status: 200 });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin") || "*";
  const { type, level, amount, userid } = await request.json();

  try {
    //-----------------------Last working question maker AI-----------------------------------

    const { text: questions } = await generateText({
      model: google('gemini-2.0-flash-001'),
      prompt: `
        You are assisting in the creation of a professional spoken-English coaching session.
    
        Your task:
        - Generate a set of high-quality English speaking questions — natural, dynamic, and conversation-driven — tailored for a real coaching environment.
    
        Session parameters:
        - Learner proficiency level: ${level}
        - Number of questions required: ${amount}
        - Session type: ${type}
    
        Key guidelines:
        - Begin with lighter, warm-up style prompts, and progressively build toward deeper, more linguistically demanding questions.
        - Calibrate difficulty precisely to the learner’s level:
          - Beginner: Focus on everyday contexts, present-tense structures, brief but organized responses, and gentle vocabulary scaffolding.
          - Intermediate: Encourage descriptive language, opinion development, situational reasoning, and structured multi-sentence replies.
          - Advanced: Drive abstract thought, argument construction, counterpoint analysis, ethical discussions, and sophisticated synthesis.
        - Adapt the question style based on session type — without ever directly mentioning the session type:
          - Technical: Anchor questions in real-world professional scenarios, applied problem-solving, and domain-specific insights.
          - Behavioral: Explore personal experiences, introspective narratives, decision-making processes, and value-driven reflections.
          - Mixed: Seamlessly transition from technical inquiries to personal storytelling.
    
        Conversation style expectations:
        - Questions must sound natural, fluid, and ready for spontaneous spoken interaction.
        - Avoid any artificial formatting such as slashes, bullet points, or mechanical constructions.
        - Ensure a natural rhythm and human tone; no robotic, overly formal, or scripted language.
    
        Return the questions **strictly** in this format:
        ["Question 1", "Question 2", "Question 3", ...]

        No introductory or closing text. Do not add labels, explanations, or formatting hints.
        Thank you! ❤️
      `
    });

    // Attempt to parse the returned questions
    let parsedQuestions = [];
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (error) {
      throw new Error('Failed to parse questions: ' + error.message);
    }

    const interview = {
      type,
      level,
      questions: parsedQuestions,
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
    return new Response(JSON.stringify({ success: false, error: e.message }), {
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
