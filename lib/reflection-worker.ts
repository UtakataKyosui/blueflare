import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;
env.useBrowserCache = true;

let generator: any = null;

self.addEventListener("message", async (event) => {
  const { text } = event.data;

  try {
    if (!generator) {
      self.postMessage({ status: 'loading', message: 'ロード中: 振り返り用AIモデル (初回のみ数分・数百MBの通信が発生します)' });
      
      generator = await pipeline("text-generation", "Xenova/Qwen1.5-0.5B-Chat", {
        progress_callback: (x: any) => {
          self.postMessage({ status: 'progress', data: x });
        }
      });
    }

    self.postMessage({ status: 'generating' });

    const messages = [
      { role: "system", content: "あなたはユーザーの思索や日記に寄り添う親身なAIです。ユーザーの言葉を読み、短い励ましの言葉や、気付きを促す短いコメントを一つだけ日本語で返してください。長文は不要です。" },
      { role: "user", content: text }
    ];

    const prompt = await generator.tokenizer.apply_chat_template(messages, {
      tokenize: false,
      add_generation_prompt: true,
    });

    const output = await generator(prompt, {
      max_new_tokens: 150,
      temperature: 0.7,
      do_sample: true,
    });

    let responseText = output[0].generated_text;
    const splitToken = "<|im_start|>assistant\n";
    if (responseText.includes(splitToken)) {
      responseText = responseText.split(splitToken).pop()?.trim() || responseText;
    }

    self.postMessage({ status: 'success', result: responseText });
  } catch (error) {
    self.postMessage({ status: 'error', error: String(error) });
  }
});
