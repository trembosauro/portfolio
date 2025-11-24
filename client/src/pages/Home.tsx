import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import Footer from "@/components/Footer";
import { ArrowRight, Zap } from "lucide-react";

export default function Home() {
  const projects = [
    {
      title: "Picpay",
      description:
        "Redesign of PicPay website homepage. Achieved 40% increase in new account registrations and 25% growth in user retention time through improved UX, standardized components, and clearer navigation.",
      link: "https://www.behance.net/gallery/221095447/Picpay",
      tags: ["UX Design", "Web Design", "Fintech"],
    },
    {
      title: "C6 Bank",
      description:
        "Digital banking platform design focusing on user-centered interactions and intuitive financial workflows.",
      link: "https://www.behance.net/kahue",
      tags: ["Product Design", "Fintech", "Mobile"],
    },
    {
      title: "BTG+",
      description:
        "Investment platform redesign combining research, design systems, and data-informed iteration for better user engagement.",
      link: "https://www.behance.net/kahue",
      tags: ["Product Design", "Finance", "UX Research"],
    },
    {
      title: "Bell App",
      description:
        "Mobile application design with focus on accessibility and seamless user experience across all touchpoints.",
      link: "https://www.behance.net/kahue",
      tags: ["Mobile Design", "App Design", "UX"],
    },
    {
      title: "Le Biscuit",
      description:
        "E-commerce platform redesign with improved product discovery and checkout experience.",
      link: "https://www.behance.net/kahue",
      tags: ["E-commerce", "Web Design", "UX"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-b from-background via-background to-card/30">
        <div className="container">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full mb-6">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm text-accent font-medium">
                Senior UX & Product Designer
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Crafting Digital Experiences That Matter
            </h1>

            <p className="text-xl text-foreground/70 mb-8 leading-relaxed">
              With 10+ years of experience across fintech, e-commerce, telecom, and SaaS, I combine research-driven design, interaction design, and data-informed iteration to deliver products that users love.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#projects"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                View My Work
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://www.behance.net/kahue"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-card/50 transition-colors"
              >
                Behance Portfolio
              </a>
            </div>

            <div className="mt-12 pt-8 border-t border-border/50 flex items-center gap-8">
              <div>
                <div className="text-2xl font-bold text-accent">923</div>
                <div className="text-sm text-foreground/60">Project Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">15</div>
                <div className="text-sm text-foreground/60">Appreciations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">7</div>
                <div className="text-sm text-foreground/60">Followers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
              About Me
            </h2>

            <div className="space-y-6 text-foreground/80 leading-relaxed">
              <p>
                I'm a Senior Product Designer with a passion for solving complex problems through user-centered design. My expertise spans end-to-end product delivery, combining research, design systems, interaction design, front-end implementation, and data-informed iteration.
              </p>

              <p>
                Throughout my career, I've worked with leading companies in fintech, e-commerce, telecom, and SaaS, collaborating closely with product managers, engineers, and stakeholders to deliver high-quality, intuitive digital products.
              </p>

              <p>
                My approach focuses on understanding user needs deeply, creating scalable design systems, and validating designs through data. I believe that great design is not just about aesthetics, but about creating seamless experiences that solve real problems and drive business results.
              </p>

              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Key Expertise
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    "UX Research",
                    "Product Design",
                    "Design Systems",
                    "Interaction Design",
                    "Fintech Design",
                    "E-commerce UX",
                  ].map((skill) => (
                    <div
                      key={skill}
                      className="px-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground/70"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 md:py-32 bg-card/30">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Featured Projects
          </h2>
          <p className="text-foreground/70 mb-12 max-w-2xl">
            A selection of my recent work showcasing my approach to design and problem-solving across different industries.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="https://www.behance.net/kahue"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:gap-3 transition-all font-semibold"
            >
              View all projects on Behance
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
