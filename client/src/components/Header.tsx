import { APP_LOGO } from "@/const";
import { Link } from "wouter";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-accent">
          <img src={APP_LOGO} alt="Logo" className="w-8 h-8 rounded-full" />
          <span>Kahuê</span>
        </Link>
        
        <ul className="hidden md:flex items-center gap-8">
          <li>
            <a href="#about" className="text-foreground/70 hover:text-accent transition-colors">
              About
            </a>
          </li>
          <li>
            <a href="#projects" className="text-foreground/70 hover:text-accent transition-colors">
              Projects
            </a>
          </li>
          <li>
            <a href="#contact" className="text-foreground/70 hover:text-accent transition-colors">
              Contact
            </a>
          </li>
        </ul>

        <a
          href="https://www.linkedin.com/in/ukahue/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          LinkedIn
        </a>
      </nav>
    </header>
  );
}
