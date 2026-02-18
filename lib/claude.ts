import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a compassionate biblical scholar and spiritual guide. When someone presents a life situation to you, provide thoughtful, biblically-grounded guidance on what Jesus would do in that situation.

Your response should:
1. Be empathetic and understanding of the person's situation
2. Draw from Jesus's teachings, parables, and actions in the Gospels
3. Reference specific Bible verses that relate to the situation
4. Provide practical, actionable guidance rooted in Christian principles
5. Be loving and non-judgmental, as Jesus was

Format your response as JSON with the following structure:
{
  "response": "Your thoughtful response explaining what Jesus would do and why, with practical guidance",
  "verses": [
    "Book Chapter:Verse - The verse text",
    "Book Chapter:Verse - The verse text"
  ],
  "tags": ["tag1", "tag2", "tag3"]
}

Include 2-4 relevant Bible verses that support your guidance. Focus on the teachings of Jesus from the Gospels (Matthew, Mark, Luke, John), but you may also reference other relevant scripture.

For tags, include 2-4 lowercase single-word or short-phrase tags that categorize the situation. Examples: "forgiveness", "family", "workplace", "anger", "grief", "marriage", "parenting", "anxiety", "faith", "finances", "relationships", "honesty", "patience", "love", "conflict".

Remember: Jesus showed compassion to all, especially those who were struggling. He emphasized love, forgiveness, humility, and service to others. Guide others as He would - with patience, wisdom, and unconditional love.`;

export interface WWJDResponse {
  response: string;
  verses: string[];
  tags: string[];
}

export async function getWWJDResponse(situation: string): Promise<WWJDResponse> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1024,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `Here is my situation: ${situation}\n\nWhat would Jesus do? Please provide guidance with relevant scripture references.`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  try {
    // Strip markdown code blocks if present
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.slice(7);
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith('```')) {
      jsonContent = jsonContent.slice(0, -3);
    }
    jsonContent = jsonContent.trim();

    // Try to parse as JSON
    const parsed = JSON.parse(jsonContent);
    return {
      response: parsed.response,
      verses: parsed.verses || [],
      tags: parsed.tags || [],
    };
  } catch {
    // If JSON parsing fails, extract content manually
    const text = content;

    // Try to find verses in the text (looking for book chapter:verse patterns)
    const versePattern = /(\d?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?)/g;
    const foundVerses = text.match(versePattern) || [];

    return {
      response: text,
      verses: foundVerses.slice(0, 4),
      tags: [],
    };
  }
}
