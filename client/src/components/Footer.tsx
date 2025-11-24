import { Mail, Linkedin, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-card border-t border-border py-12">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Kahuê Morais</h3>
            <p className="text-foreground/70 text-sm">
              Senior UX Designer & Product Designer with 10+ years of experience in fintech, e-commerce, and SaaS.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#about"
                  className="text-foreground/70 hover:text-accent transition-colors text-sm"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#projects"
                  className="text-foreground/70 hover:text-accent transition-colors text-sm"
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  href="https://www.behance.net/kahue"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-accent transition-colors text-sm flex items-center gap-1"
                >
                  Behance <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/in/ukahue/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-muted hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@example.com"
                className="p-2 bg-muted hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-8">
          <p className="text-center text-foreground/50 text-sm">
            © 2025 Kahuê Morais. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
