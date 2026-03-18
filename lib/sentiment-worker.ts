import { pipeline, env } from "@huggingface/transformers";

// Web環境でローカルモデルやWASMを利用するための設定
env.allowLocalModels = false;
env.useBrowserCache = true;

let sentimentPipeline: any = null;

self.addEventListener("message", async (event) => {
  const { text } = event.data;
  
  try {
    if (!sentimentPipeline) {
      // Transformer.js を用いてブラウザ側で軽量感情分析モデルをロード
      self.postMessage({ status: 'loading' });
      sentimentPipeline = await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
    }
    
    // 推論を実行
    const result = await sentimentPipeline(text);
    self.postMessage({ status: 'success', result });
  } catch (error) {
    self.postMessage({ status: 'error', error: String(error) });
  }
});
