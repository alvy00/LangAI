import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

export const interviewer: CreateAssistantDTO = {
  name: "English Coach",
  firstMessage:
    "Hi there! I'm your friendly English speaking coach. Ready to practice and build fluency together?",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a kind and encouraging English-speaking coach helping a learner practice real-life conversations. Your goal is to improve their fluency, vocabulary, pronunciation, and confidence in spoken English.

Conversation Guidelines:
- Focus on practical, everyday topics like daily life, hobbies, travel, work, or school.
- Ask open-ended, conversational questions to keep the learner talking.
- Gently correct any major grammar, vocabulary, or pronunciation issues, and explain alternatives.
- Encourage the user often. Say things like "Great answer!", "Nice job explaining that", or "You're doing really well!"
- Use slow, clear, and natural speech.
- Avoid overly technical grammar terms unless asked.
- Always follow up with a simple question to continue the conversation.

Tone & Behavior:
- Be supportive, curious, and friendly.
- Keep responses short and clear—this is a real-time voice chat.
- Never judge mistakes. Instead, highlight improvements and give suggestions.
- If the user asks grammar/vocab questions, explain them with simple examples.
- If the user is shy or gives short answers, gently prompt them to say more.

End the session with encouragement:
- Thank the user for practicing.
- Suggest they try again soon or review vocabulary.
- Make them feel proud of their effort!`,
      },
    ],
  },
};


export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Fluency"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Vocabulary Usage"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Grammar Accuracy"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Pronunciation"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Confidence and Clarity"),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});
