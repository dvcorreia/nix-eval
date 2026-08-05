import "./style.css";
import "./components/code-editor.js";
import "./components/accordion.js";
import "./components/eval-field.js";
import "./components/eval-output.js";
import { createNixEvaluator } from "./evaluator.js";
import { NixCodeEditor } from "./components/code-editor.js";
import dotaliases from "./assets/dotaliases.nix?raw";

async function init(): Promise<void> {
  const nix = await createNixEvaluator(document);

  document.addEventListener("code-change", (event) => {
    const source = (event as CustomEvent<{ code: string }>).detail.code;
    if (source) void nix(source);
  });

  const editor = document.querySelector("code-editor") as NixCodeEditor | null;
  if (editor) editor.code = dotaliases.trim();
}

void init();
