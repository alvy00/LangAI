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
        You are an expert English language trainer, tasked with designing a complex, thought-provoking session. Below are the conditions:
        - The learner’s proficiency level is ${level}.
        - The amount of questions required is: ${amount}.
        - The session type is: ${type}.
        
        Your goal is to craft a comprehensive set of English language questions that engage the learner’s abilities across multiple dimensions of language use. This includes the following categories:
        - **Grammar** (Advanced syntax, tense shifts, conditionals, complex sentence structures)
        - **Vocabulary** (Advanced, idiomatic, and academic vocabulary, including phrasal verbs, collocations, and figurative language)
        - **Listening Comprehension** (Difficult spoken excerpts, contextual clues, and tone or mood interpretation)
        - **Speaking Fluency** (Conversational nuances, persuasive language, and rhetorical devices)
        - **Cultural Nuance** (Understanding of cultural context and pragmatics in communication)
        - **Critical Thinking & Logical Reasoning** (Evaluating arguments, drawing conclusions, and debating controversial topics)
    
        For each of the following proficiency levels, design questions that are appropriately challenging:
    
        **For **beginner learners**:**
        - Focus on reinforcing basic sentence structure, clear pronunciation, and common vocabulary.
        - Include foundational grammar points such as subject-verb agreement, basic present/past/future tenses, and simple question structures.
        - Provide straightforward questions that ensure comprehension of simple texts or dialogues (e.g., interpreting simple instructions or answering "yes/no" questions).
        - Encourage the learner to form complete sentences using essential vocabulary and avoid ambiguity.
    
        **For **intermediate learners**:**
        - Integrate intermediate grammatical structures like relative clauses, conditional sentences, modals, and passive voice.
        - Design questions that require the learner to infer meaning from context, such as understanding phrases in social situations.
        - Test their ability to interpret and respond to scenarios involving ambiguity or nuanced language.
        - Include vocabulary that stretches the learner’s ability to express complex ideas but remains practical for real-world situations.
    
        **For **advanced learners**:**
        - Create high-level questions that evaluate command over advanced syntax, such as inversion, parallelism, and nominalization.
        - Engage learners in conversations about abstract, philosophical, or sociopolitical topics that demand sophisticated argumentation and the ability to critically evaluate evidence.
        - Test their knowledge of idiomatic expressions, phrasal verbs, and cultural references that might appear in academic or professional contexts.
        - Include advanced reasoning tasks, such as solving logic problems, interpreting and critiquing complex texts, or explaining subtle shades of meaning in literature or media.
    
        Additional details to consider:
        - **Pragmatics**: Ensure questions reflect awareness of social context (e.g., politeness levels, formal vs. informal speech, understanding metaphorical language).
        - **Cultural Context**: Incorporate questions that require learners to draw on knowledge of different English-speaking cultures or cross-cultural communication skills.
        - **Linguistic Precision**: Encourage the learner to demonstrate accurate use of vocabulary, precise grammar, and correct sentence structure, while also enabling them to express nuance and subtlety.
        - **Critical Reasoning**: Add questions that encourage learners to argue their point, offer counterarguments, and use language persuasively.
        - **Cognitive Load**: For advanced learners, craft questions that require multi-step reasoning, such as complex discussions of global issues, ethical dilemmas, or hypothetical situations that demand creative problem-solving.
    
        The questions should be well-balanced across different language domains and be designed in a way that increases in complexity as the session progresses.
    
        **Formatting:**
        - Avoid any special characters that could interfere with speech recognition (e.g., "/", "*").
        - Return the questions in a structured list, with each question properly numbered, like so:
          ["Question 1", "Question 2", "Question 3", ...].
        - Maintain logical flow across questions, ensuring that questions build upon each other and escalate in difficulty.
    
        Thank you for generating a sophisticated and challenging set of questions tailored to the learner’s level, session type, and cognitive abilities. Your questions should not only test language proficiency but also push learners to engage with advanced linguistic, cultural, and logical concepts.
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
