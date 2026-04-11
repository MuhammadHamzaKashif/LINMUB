import { pipeline } from '@xenova/transformers';

class AIEngine {
  static task = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance = null;

  static async getInstance() {
    if (this.instance === null) {
      console.log("Loading AI Model into memory... (This takes a few seconds on first run)");
      this.instance = await pipeline(this.task, this.model);
      console.log("Model Loaded Successfully!");
    }
    return this.instance;
  }
}

/*
    Func that takes in text (interests in our case)
    and converts them into embeddings (real tasty shat we gonna use)
*/
export const generateEmbedding = async (text) => {
  try {
    const extractor = await AIEngine.getInstance();
    const output = await extractor(text, { pooling: 'mean', normalize: true });

    return Array.from(output.data);
  } catch (error) {
    console.error("AI Embedding Error:", error);
    return [];
  }
};