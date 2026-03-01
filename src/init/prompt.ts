import readline from "node:readline";

function createInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  });
}

function formatOptions(options: { label: string }[]): string {
  return options.map((o, i) => `  [${i + 1}] ${o.label}`).join("\n");
}

export async function askInput(question: string): Promise<string> {
  const rl = createInterface();
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function askChoice<T extends string>(
  question: string,
  options: { label: string; value: T }[],
): Promise<T> {
  const prompt = `${question}\n${formatOptions(options)}\n> `;
  for (;;) {
    const answer = await askInput(prompt);
    const idx = Number.parseInt(answer, 10) - 1;
    if (idx >= 0 && idx < options.length) {
      return options[idx].value;
    }
    console.error("無効な選択です。番号を入力してください。");
  }
}

export async function askMultiChoice<T extends string>(
  question: string,
  options: { label: string; value: T }[],
): Promise<T[]> {
  const prompt = `${question} (カンマ区切りで複数選択可)\n${formatOptions(options)}\n> `;
  for (;;) {
    const answer = await askInput(prompt);
    const indices = answer
      .split(",")
      .map((s) => Number.parseInt(s.trim(), 10) - 1);
    const valid = indices.every((i) => i >= 0 && i < options.length);
    if (valid && indices.length > 0) {
      return indices.map((i) => options[i].value);
    }
    console.error("無効な選択です。例: 1,3");
  }
}
