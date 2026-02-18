// Content moderation for WWJD submissions using OpenAI Moderation API

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ModerationResult {
  allowed: boolean;
  category?: string;
  guidance?: string;
  flaggedCategories?: string[];
}

// Compassionate responses for each category
const GUIDANCE_RESPONSES: Record<string, string> = {
  'self-harm': `I sense you may be going through a very difficult time. Please know that you are deeply loved and valued. If you're having thoughts of harming yourself, please reach out for help:

**National Suicide Prevention Lifeline**: 988 (call or text)
**Crisis Text Line**: Text HOME to 741741

Jesus said, "Come to me, all you who are weary and burdened, and I will give you rest" (Matthew 11:28). You don't have to face this alone. Please speak to a trusted counselor, pastor, or mental health professional.`,

  'self-harm/intent': `I sense you may be going through a very difficult time. Please know that you are deeply loved and valued. If you're having thoughts of harming yourself, please reach out for help immediately:

**National Suicide Prevention Lifeline**: 988 (call or text)
**Crisis Text Line**: Text HOME to 741741
**Emergency**: 911

Jesus said, "Come to me, all you who are weary and burdened, and I will give you rest" (Matthew 11:28). You don't have to face this alone. Please reach out now.`,

  'self-harm/instructions': `I cannot provide guidance on this topic. If you're struggling, please reach out for help:

**National Suicide Prevention Lifeline**: 988 (call or text)
**Crisis Text Line**: Text HOME to 741741

You are loved and valued. Please speak to a professional who can help.`,

  violence: `I hear that you may be experiencing strong emotions. Jesus calls us to love even our enemies and to seek peace.

If you're feeling overwhelmed by anger or thoughts of harming others, please reach out to a counselor or mental health professional who can help you process these feelings safely.

"Blessed are the peacemakers, for they will be called children of God." (Matthew 5:9)`,

  'violence/graphic': `This question involves content that this platform cannot address. Jesus calls us to peace and love.

If you're struggling with difficult thoughts, please consider speaking with a mental health professional or pastor.

"Blessed are the peacemakers, for they will be called children of God." (Matthew 5:9)`,

  hate: `Jesus calls us to love all people, including those who are different from us.

"A new command I give you: Love one another. As I have loved you, so you must love one another." (John 13:34)

If you're struggling with feelings of anger or resentment, consider speaking with a pastor or counselor who can help you work through these emotions.`,

  'hate/threatening': `This platform cannot provide guidance on this topic. Jesus calls us to love, not harm.

"But I tell you, love your enemies and pray for those who persecute you." (Matthew 5:44)

If you're experiencing intense emotions, please reach out to a mental health professional.`,

  sexual: `This question involves content that may not be appropriate for this platform. For guidance on relationships and intimacy, please consider speaking with a trusted pastor or Christian counselor who can provide personalized, biblically-grounded advice.`,

  'sexual/minors': `This question involves content that this platform cannot address. If you need guidance, please speak with appropriate authorities or a licensed professional.`,

  harassment: `Jesus calls us to treat others with dignity and respect.

"Do to others as you would have them do to you." (Luke 6:31)

If you're experiencing conflict with someone, consider speaking with a pastor or counselor about healthy ways to address the situation.`,

  'harassment/threatening': `This platform cannot provide guidance that could lead to harm. Jesus calls us to peace.

"If it is possible, as far as it depends on you, live at peace with everyone." (Romans 12:18)

Please consider speaking with a counselor if you're struggling with difficult emotions.`,

  illicit: `This platform cannot provide guidance on illegal activities. Jesus calls us to live righteously and respect the law.

"Let everyone be subject to the governing authorities." (Romans 13:1)

If you're facing a difficult situation, please consider speaking with a pastor, counselor, or appropriate professional.`,

  'illicit/violent': `This platform cannot provide guidance on this topic. Please seek appropriate professional help if you're struggling.`,
};

// Map OpenAI categories to our response categories
function mapCategory(openAICategory: string): string {
  // OpenAI returns categories like "self-harm", "self-harm/intent", "violence", etc.
  // We use them directly since our GUIDANCE_RESPONSES keys match
  return openAICategory;
}

// Priority order for categories (most severe first)
const CATEGORY_PRIORITY = [
  'sexual/minors',
  'self-harm/intent',
  'self-harm/instructions',
  'illicit/violent',
  'violence/graphic',
  'hate/threatening',
  'harassment/threatening',
  'self-harm',
  'violence',
  'sexual',
  'hate',
  'harassment',
  'illicit',
];

export async function moderateContent(text: string): Promise<ModerationResult> {
  try {
    const response = await openai.moderations.create({
      input: text,
    });

    const result = response.results[0];

    if (!result.flagged) {
      return { allowed: true };
    }

    // Get all flagged categories
    const flaggedCategories: string[] = [];
    const categories = result.categories as Record<string, boolean>;

    for (const [category, flagged] of Object.entries(categories)) {
      if (flagged) {
        flaggedCategories.push(category);
      }
    }

    // Find the highest priority flagged category
    let primaryCategory = flaggedCategories[0];
    for (const priorityCategory of CATEGORY_PRIORITY) {
      if (flaggedCategories.includes(priorityCategory)) {
        primaryCategory = priorityCategory;
        break;
      }
    }

    // Get the appropriate guidance response
    let guidance = GUIDANCE_RESPONSES[primaryCategory];

    // Fallback if we don't have a specific response for this category
    if (!guidance) {
      // Try parent category (e.g., "self-harm" for "self-harm/intent")
      const parentCategory = primaryCategory.split('/')[0];
      guidance = GUIDANCE_RESPONSES[parentCategory];
    }

    // Ultimate fallback
    if (!guidance) {
      guidance = `This question involves content that this platform may not be best equipped to address. Please consider speaking with a trusted pastor, counselor, or appropriate professional for guidance on this matter.

"Trust in the Lord with all your heart and lean not on your own understanding." (Proverbs 3:5)`;
    }

    return {
      allowed: false,
      category: primaryCategory,
      guidance,
      flaggedCategories,
    };
  } catch (error) {
    console.error('OpenAI Moderation API error:', error);
    // On API error, allow the content through (fail open)
    // The AI itself has safety measures
    return { allowed: true };
  }
}
