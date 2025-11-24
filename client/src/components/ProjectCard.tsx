import { ExternalLink } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  image?: string;
  link: string;
  tags?: string[];
}

export default function ProjectCard({
  title,
  description,
  image,
  link,
  tags = [],
}: ProjectCardProps) {
  return (
    <div className="group bg-card hover:bg-card/80 border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/20">
      {image && (
        <div className="relative w-full h-48 overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
          {title}
        </h3>
        
        <p className="text-foreground/70 text-sm mb-4 line-clamp-3">
          {description}
        </p>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-accent hover:gap-3 transition-all"
        >
          View Project
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
