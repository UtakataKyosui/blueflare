import { pipeline, env } from "@huggingface/transformers";

// Web環境でローカルモデルやWASMを利用するための設定
env.allowLocalModels = false;
env.useBrowserCache = true;

let sentimentPipeline: any = null;
let loadingPromise: Promise<any> | null = null;

async function getPipeline() {
  if (sentimentPipeline) return sentimentPipeline;
  if (!loadingPromise) {
    self.postMessage({ status: 'loading' });
    loadingPromise = pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english")
      .then(p => { sentimentPipeline = p; return p; });
  }
  return loadingPromise;
}

self.addEventListener("message", async (event) => {
  const { text, type } = event.data;

  try {
    const pipe = await getPipeline();

    if (type === 'warmup') {
      self.postMessage({ status: 'ready' });
      return;
    }

    const result = await pipe(text);
    self.postMessage({ status: 'success', result });
  } catch (error) {
    self.postMessage({ status: 'error', error: String(error) });
  }
});
