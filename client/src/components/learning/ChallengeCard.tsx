import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const difficultyColors = {
  easy: { bg: "bg-green-100", text: "text-green-800" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-800" },
  hard: { bg: "bg-red-100", text: "text-red-800" }
};

const languageIcons = {
  javascript: { icon: "fab fa-js", bg: "bg-secondary-light bg-opacity-20", text: "text-secondary-dark" },
  python: { icon: "fab fa-python", bg: "bg-primary-light bg-opacity-20", text: "text-primary-dark" },
  cpp: { icon: "fas fa-code", bg: "bg-success-light bg-opacity-20", text: "text-success-dark" }
};

interface ChallengeCardProps {
  challenge: {
    id: number;
    title: string;
    description: string;
    language: string;
    difficulty: string;
    estimatedMinutes?: number;
  };
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { id, title, description, language, difficulty, estimatedMinutes } = challenge;
  
  const languageInfo = languageIcons[language] || { 
    icon: "fas fa-code", 
    bg: "bg-neutral-light bg-opacity-20", 
    text: "text-neutral-700" 
  };
  
  const difficultyInfo = difficultyColors[difficulty.toLowerCase()] || { 
    bg: "bg-neutral-100", 
    text: "text-neutral-800" 
  };

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex justify-between items-start mb-3">
          <div className={`rounded-md ${languageInfo.bg} p-2`}>
            <i className={`${languageInfo.icon} ${languageInfo.text}`}></i>
          </div>
          <Badge 
            variant="outline"
            className={`${difficultyInfo.bg} ${difficultyInfo.text} border-0 text-xs font-medium px-2.5 py-0.5 rounded-full`}
          >
            {difficulty}
          </Badge>
        </div>
        <h3 className="font-medium text-lg mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
          {description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-neutral-500">
            Estimated: {estimatedMinutes || 20} min
          </span>
          <Link href={`/challenges/${id}`}>
            <a className="text-primary hover:text-primary-light text-sm font-medium">
              Start Challenge
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
