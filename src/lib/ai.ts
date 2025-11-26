// AI service for Groq API integration

export interface GeneratedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqRequest {
  model: string;
  messages: GroqMessage[];
  stream: boolean;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

class AIService {
  private apiKey: string;
  private baseURL = 'https://api.groq.com/openai/v1';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('NEXT_PUBLIC_GROQ_API_KEY not set. AI features will be disabled.');
    }
  }

  private async callGroqAPI(messages: GroqMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured. Please set NEXT_PUBLIC_GROQ_API_KEY environment variable.');
    }

    const requestBody: GroqRequest = {
      model: 'llama-3.3-70b-versatile',
      messages,
      stream: false,
    };

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${errorText} (status: ${response.status})`);
    }

    const data: GroqResponse = await response.json();

    if (data.error) {
      throw new Error(`Groq API error: ${data.error.message}`);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from AI');
    }

    return data.choices[0].message.content;
  }

  /**
   * Generates tasks from a natural language prompt
   */
  async generateTasksFromPrompt(prompt: string, boardContext?: string): Promise<GeneratedTask[]> {
    const systemPrompt = `You are a task management assistant. Given a user's request, generate a list of actionable tasks in JSON format.
Each task should have:
- title: A clear, concise task title (required)
- description: A detailed description of what needs to be done (required)
- priority: One of "low", "medium", "high", or "urgent" (required)
- due_date: Optional ISO 8601 date string if a due date can be inferred

Return ONLY a valid JSON array of task objects, no other text. Example format:
[
  {
    "title": "Implement user authentication",
    "description": "Create login and signup pages with email/password authentication",
    "priority": "high",
    "due_date": "2024-12-15T00:00:00Z"
  }
]`;

    let userPrompt = `User request: ${prompt}`;
    if (boardContext) {
      userPrompt += `\n\nBoard context: ${boardContext}`;
    }

    const content = await this.callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Parse JSON from the response
    try {
      // Try to extract JSON from markdown code blocks if present
      let jsonContent = content.trim();
      const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }

      const tasks: GeneratedTask[] = JSON.parse(jsonContent);

      // Validate and set defaults
      return tasks.map((task) => ({
        ...task,
        priority: task.priority || 'medium',
        description: task.description || '',
      }));
    } catch (error) {
      console.error('Failed to parse AI response:', error, 'Content:', content);
      throw new Error('Failed to parse AI response as JSON. Please try again.');
    }
  }

  /**
   * Breaks down a complex task into smaller subtasks
   */
  async breakDownTask(title: string, description?: string): Promise<GeneratedTask[]> {
    const systemPrompt = `You are a task management assistant. Given a complex task, break it down into smaller, actionable subtasks.
Each subtask should be:
- Specific and actionable
- Independent enough to be worked on separately
- Have a clear title and description

Return ONLY a valid JSON array of task objects, no other text. Each task should have:
- title: A clear, concise task title (required)
- description: A detailed description of what needs to be done (required)
- priority: One of "low", "medium", "high", or "urgent" (required, inherit from parent if appropriate)
- due_date: Optional ISO 8601 date string

Example format:
[
  {
    "title": "Design database schema",
    "description": "Create ER diagram and define tables for user authentication",
    "priority": "high"
  }
]`;

    const userPrompt = `Break down this task into smaller subtasks:\n\nTitle: ${title}\n${description ? `Description: ${description}` : ''}`;

    const content = await this.callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Parse JSON from the response
    try {
      // Try to extract JSON from markdown code blocks if present
      let jsonContent = content.trim();
      const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }

      const tasks: GeneratedTask[] = JSON.parse(jsonContent);

      // Validate and set defaults
      return tasks.map((task) => ({
        ...task,
        priority: task.priority || 'medium',
        description: task.description || '',
      }));
    } catch (error) {
      console.error('Failed to parse AI response:', error, 'Content:', content);
      throw new Error('Failed to parse AI response as JSON. Please try again.');
    }
  }
}

export const aiService = new AIService();

