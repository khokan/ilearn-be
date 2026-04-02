import dotenv from "dotenv";

dotenv.config();

type QuizQuestion = {
  type: "mcq" | "truefalse";
  question: string;
  options?: string[] | undefined;
  answer: string;
};

export type GenerateQuizQuestionsInput = {
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  gradeLevel?: string;
  numberOfQuestions?: number;
};

export type StudyPathGeneratorInput = {
  objective: string;
};

type StudyPathGeneratorOutput = {
  roadmap: {
    day: number;
    title: string;
    tasks: string[];
    tip: string;
  }[];
};

const ensureGenkitEnv = () => {
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error("GOOGLE_GENAI_API_KEY not found in environment variables");
  }
};

const getGenkit = async () => {
  const [{ googleAI }, { genkit, z }] = await Promise.all([
    import("@genkit-ai/googleai"),
    import("genkit"),
  ]);

  ensureGenkitEnv();

  const ai = genkit({
    plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || "" })],
    model: googleAI.model("gemini-2.5-flash", { temperature: 0.8 }),
  });

  return { ai, z };
};

export const generateQuizQuestions = async (
  input: GenerateQuizQuestionsInput
): Promise<QuizQuestion[]> => {
  const { ai, z } = await getGenkit();

  const questionInputSchema = z.object({
    topic: z.string(),
    difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
    gradeLevel: z.string().default("High School"),
    numberOfQuestions: z.number().min(1).max(10).default(5),
  });

  const questionSchema = z.array(
    z.object({
      type: z.enum(["mcq", "truefalse"]),
      question: z.string(),
      options: z.array(z.string()).optional(),
      answer: z.string(),
    })
  );

  const flow = ai.defineFlow(
    {
      name: "examQuestionFlow",
      inputSchema: questionInputSchema,
      outputSchema: questionSchema,
    },
    async (flowInput) => {
      const prompt = `
Generate ${flowInput.numberOfQuestions ?? 5} practice quiz questions on the topic "${flowInput.topic}".
Include a mix of MCQ and true/false.
Difficulty: ${flowInput.difficulty}.
Grade Level: ${flowInput.gradeLevel ?? "High School"}.
Return JSON array with fields: type, question, options (if MCQ), answer.
`;

      const { output } = await ai.generate({
        prompt,
        output: { schema: questionSchema },
      });

      if (!output) {
        throw new Error("Failed to generate questions");
      }

      return output as QuizQuestion[];
    }
  );

  return flow({
    topic: input.topic,
    difficulty: input.difficulty,
    gradeLevel: input.gradeLevel ?? "High School",
    numberOfQuestions: input.numberOfQuestions ?? 5,
  });
};

export const studyPathGenerator = async (
  input: StudyPathGeneratorInput
): Promise<StudyPathGeneratorOutput> => {
  const { ai, z } = await getGenkit();

  const studyPathGeneratorInputSchema = z.object({
    objective: z.string(),
  });

  const studyPathGeneratorOutputSchema = z.object({
    roadmap: z.array(
      z.object({
        day: z.number(),
        title: z.string(),
        tasks: z.array(z.string()),
        tip: z.string(),
      })
    ),
  });

  const prompt = ai.definePrompt({
    name: "studyPathGeneratorPrompt",
    input: { schema: studyPathGeneratorInputSchema },
    output: { schema: studyPathGeneratorOutputSchema },
    prompt: `You are an expert academic advisor and study planning assistant. Your goal is to create a structured, actionable, and encouraging study roadmap for a student.

The user's objective is: "{{objective}}"

Analyze the user's objective to understand the subject, goal, and timeframe.

Generate a day-by-day study plan that breaks down the objective into manageable tasks. The plan should cover the entire duration mentioned in the objective.

For each day, provide:
1. A "day" number.
2. A short, motivational "title" for that day's session.
3. An array of specific, actionable "tasks".
4. A helpful "tip" for motivation or study strategy.

Ensure the final output is a valid JSON object matching the defined schema.
`,
  });

  const flow = ai.defineFlow(
    {
      name: "studyPathGeneratorFlow",
      inputSchema: studyPathGeneratorInputSchema,
      outputSchema: studyPathGeneratorOutputSchema,
    },
    async (flowInput: StudyPathGeneratorInput) => {
      const { output } = await prompt(flowInput);

      if (!output) {
        throw new Error("Failed to generate study path");
      }

      return output;
    }
  );

  return flow(input);
};