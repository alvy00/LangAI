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
    // -----------------------Last working question maker AI-----------------------------------

    // const { text: questions } = await generateText({
    //   model: google('gemini-2.0-flash-001'),
    //   prompt: `
    //     Prepare a set of advanced, spoken-English training questions tailored for a professional English coaching session.

    //     The learner's proficiency level is: ${level}.
    //     The amount of questions required is: ${amount}.
    //     The session type is: ${type}.  // Include session type in the prompt

    //     Please return only the questions, without any additional text.

    //     Guidelines:
    //     - Ensure a progressive cognitive gradient: begin with warm-up style questions and gradually increase complexity and linguistic demand.
    //     - Dynamically match difficulty to proficiency level:
    //       - Beginner: Focus on present-tense usage, common daily life situations, short structured answers, and vocabulary scaffolding.
    //       - Intermediate: Introduce descriptive, opinion-based, and situational questions that require logical reasoning or multi-sentence replies.
    //       - Advanced: Push for abstract thinking, synthesis, argument construction, counterpoint analysis, and hypothetical or ethical scenarios.
    //     - Align with session type context:
    //       - Technical: Ask questions rooted in real-world professional challenges, problem-solving workflows, or applied knowledge within a specific domain.
    //       - Behavioral: Focus on introspective prompts, past experience narratives, value-based decisions, and soft skills evaluation.
    //       - Mixed: Blend both domains and include transition-style questions that shift from technical expertise to personal reflection.
    //     - Prioritize spoken realism: simulate how a human coach or voice assistant would naturally ask questions during a live session.
    //     - Ensure questions are speech-friendly:
    //       - Avoid written formatting (slashes, asterisks, hyphenation).
    //       - Keep sentence flow natural for a voice assistant.
    //       - No overly formal or robotic phrasing.

    //     Return the questions **strictly** in this format:
    //     ["Question 1", "Question 2", "Question 3", ...]

    //     No introductory or closing text. Do not add labels, explanations, or formatting hints.
    //     Thank you! ❤️
    //     `
    // });

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
    
        Critical output rules:
        - Return **only** a clean JSON array of questions, formatted exactly like: ["Question 1", "Question 2", "Question 3", ...]
        - Do not add any introductions, labels, context notes, or closing remarks — only the list.
    
        Thank you!
      `
    });

    const interview = {
      type,
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
