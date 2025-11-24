import { Mail, Linkedin, ExternalLink, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-card border-t border-border py-16 md:py-20">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-12 md:gap-16 mb-12">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Kahuê Morais</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Senior UX Designer & Product Designer with 10+ years of experience in fintech, e-commerce, and SaaS.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#about"
                  className="text-foreground/70 hover:text-accent transition-colors text-sm font-medium"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#projects"
                  className="text-foreground/70 hover:text-accent transition-colors text-sm font-medium"
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  href="https://www.behance.net/kahue"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-accent transition-colors text-sm font-medium flex items-center gap-2"
                >
                  Behance <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                <a
                  href="mailto:kahuemorais@gmail.com"
                  className="text-foreground/70 hover:text-accent transition-colors text-sm font-medium"
                >
                  kahuemorais@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                <a
                  href="tel:+5511910612191"
                  className="text-foreground/70 hover:text-accent transition-colors text-sm font-medium"
                >
                  +55 11 91061-2191
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-accent" />
                <a
                  href="https://www.linkedin.com/in/ukahue/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-accent transition-colors text-sm font-medium"
                >
                  linkedin.com/in/ukahue
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-8">
          <p className="text-center text-foreground/50 text-sm font-medium">
            © 2025 Kahuê Morais. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
