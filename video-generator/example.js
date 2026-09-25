import { config, higgsfield } from "@higgsfield/client/v2";

if (!process.env.HF_CREDENTIALS) {
  console.error("Falta HF_CREDENTIALS en .env.local (formato key-id:key-secret).");
  process.exit(1);
}

config({ credentials: process.env.HF_CREDENTIALS, maxPollTime: 15 * 60 * 1000 });

try {
  const result = await higgsfield.subscribe("bytedance/seedance-2.5/text-to-video", {
    input: {
      prompt: "A cinematic scene at sunset",
      duration: 5,
      resolution: "720p",
      aspect_ratio: "16:9",
    },
    withPolling: true,
  });

  if (result.status === "completed" && result.video?.url) {
    console.log("Video generado:", result.video.url);
  } else {
    const reason = result.status === "nsfw" ? "bloqueado por moderación" : `estado "${result.status}"`;
    console.error(`La generación no se completó: ${reason} (request ${result.request_id}).`);
    process.exit(1);
  }
} catch (err) {
  console.error("Error llamando a Higgsfield:", err.name, "-", err.message);
  process.exit(1);
}
