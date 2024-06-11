import { IconGithub, IconPaper } from "./icons";

export default function Footer() {
  return (
    <footer className="flex w-full items-center justify-center gap-4">
      <p className="text-xl p-0">NeuronautLLM</p>
      <a href="#" className="text-xl p-0" title="Link to source code">
        <IconGithub />
      </a>
      <a href="#" className="text-xl p-0" title="Link to research paper">
        <IconPaper />
      </a>
    </footer>
  );
}