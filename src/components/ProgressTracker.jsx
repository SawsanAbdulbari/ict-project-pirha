// This component renders a detailed card showing the user's overall completion percentage and their status on each major section of the guide.
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { CheckCircle, Circle, Clock, Target } from 'lucide-react';
// The ProgressTracker component receives the overall progress as a number, an array of strings representing the keys of the sections the user has visited, the key of the section the user is currently viewing, and a boolean indicating if the initial survey is done as props.
const ProgressTracker = ({ 
  completionPercentage = 0, 
  visitedSections = [], 
  currentSection = null,
  surveyCompleted = false 
}) => {
  // This array defines the structure of the progress tracker, listing all the trackable sections.
  const sections = [
    { key: 'survey', name: 'Kysely', required: true },
    { key: 'movement', name: 'Liikkuminen', required: false },
    { key: 'nutrition', name: 'Ravitsemus', required: false },
    { key: 'mental_wellbeing', name: 'Henkinen jaksaminen', required: false },
    { key: 'substance_use', name: 'Päihteiden käyttö', required: false },
    { key: 'other_diseases', name: 'Muut sairaudet', required: false }
  ];
  // This function returns a color class based on the completion percentage.
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  // This function returns a motivational message based on the completion percentage.
  const getProgressMessage = (percentage) => {
    if (percentage >= 90) return 'Erinomaista! Olet melkein valmis.';
    if (percentage >= 70) return 'Hyvää edistystä! Jatka samaan malliin.';
    if (percentage >= 50) return 'Puolivälissä! Hyvin menee.';
    if (percentage >= 25) return 'Hyvä alku! Jatka tutustumista.';
    return 'Tervetuloa! Aloita tutustuminen oppaaseen.';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Edistymisesi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* This is the overall progress bar section, including the display of the percentage and the motivational message. */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Kokonaisedistyminen</span>
            <span className="text-sm font-bold">{completionPercentage}%</span>
          </div>
          <Progress 
            value={completionPercentage} 
            className="h-2"
          />
          <p className="text-xs text-gray-600 italic">
            {getProgressMessage(completionPercentage)}
          </p>
        </div>

        {/* This is the section-by-section progress area. It maps over the sections array to render each item. */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Osiot:</h4>
          <div className="space-y-2">
            {sections.map((section) => {
              const isVisited = visitedSections.includes(section.key) || 
                               (section.key === 'survey' && surveyCompleted);
              const isCurrent = currentSection === section.key;
              
              return (
                // For each section item, the logic for determining its state (visited, current, or not started) and how the icon and styling are conditionally applied is clarified.
                <div 
                  key={section.key}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                    isCurrent ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {isVisited ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`text-sm ${
                      isVisited ? 'text-green-700 font-medium' : 
                      isCurrent ? 'text-blue-700 font-medium' : 
                      'text-gray-600'
                    }`}>
                      {section.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {isVisited && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Valmis
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// This is a simple, standalone progress bar suitable for use in headers or other compact spaces. It receives the completion percentage as a prop.
export const MiniProgressBar = ({ completionPercentage = 0 }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      {/* The width style is used to set the progress. */}
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${completionPercentage}%` }}
      />
    </div>
  );
};

// This is a small badge component that displays the completion percentage with a color that reflects the progress level. It receives the completion percentage as a prop.
export const ProgressBadge = ({ completionPercentage = 0 }) => {
  // This function determines the badge's visual variant (color) based on the percentage.
  const getVariant = (percentage) => {
    if (percentage >= 80) return 'default'; // Green
    if (percentage >= 50) return 'secondary'; // Blue
    return 'outline'; // Gray
  };

  return (
    <Badge variant={getVariant(completionPercentage)} className="font-medium">
      {completionPercentage}% valmis
    </Badge>
  );
};

export default ProgressTracker;