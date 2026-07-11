import { chat } from "../services/llm.service.js";

async function main() {
  const response = await chat([
    {
      role: "user",
      content: "Hi, which model are you",
    },
  ]);

  console.log(response);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});