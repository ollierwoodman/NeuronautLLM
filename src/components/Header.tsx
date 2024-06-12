import Image from "next/image";

export default function Header() {
  return (
    <header className="flex items-center justify-center gap-4">
      <Image 
        src="/NeuronautLLM.png" 
        alt="Neuronaut LLM logo" 
        width={50} 
        height={50}
        className="-my-2"
        priority
      />
      <h1 className="text-4xl">NeuronautLLM</h1>
    </header>
  );
}