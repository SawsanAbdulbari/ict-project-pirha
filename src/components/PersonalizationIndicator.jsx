// This component is a banner that informs the user about content personalization.
import React, { useState, useEffect } from 'react';
import { User, Eye, EyeOff, Info } from 'lucide-react';
import { getUserProfile, getAgeGroupDisplay, getLifestyleDisplay, getHealthConditionDisplay } from '../utils/userProfile';
// The PersonalizationIndicator component receives an optional function to be called when the user toggles the view.
const PersonalizationIndicator = ({ onToggleView = null }) => {
  // This state holds the user's profile data.
  const [profile, setProfile] = useState(null);
  // This state tracks the state of the "Show All" / "Show Personalized" toggle.
  const [showAllContent, setShowAllContent] = useState(false);
  // This state toggles the visibility of the user's survey answers (age, lifestyle, etc.).
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  useEffect(() => {
    // The user profile is loaded from local storage via the utility function getUserProfile when the component mounts.
    const userProfile = getUserProfile();
    setProfile(userProfile);
    setShowAllContent(userProfile.showAllContent);
  }, []);
  // This check prevents the indicator from rendering if the user hasn't completed the survey.
  if (!profile || !profile.hasCompletedSurvey) {
    return null; 
  }
  // This function updates the local state and calls the onToggleView prop if it was provided.
  const handleToggleView = () => {
    const newValue = !showAllContent;
    setShowAllContent(newValue);
    if (onToggleView) {
      onToggleView(newValue);
    }
  };

  return (
    // The main container and its styling.
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Sisältö personoitu sinulle</h3>
            {/* The info button that toggles the display of the user's profile details. */}
            <button
              onClick={() => setShowProfileDetails(!showProfileDetails)}
              className="ml-2 text-blue-600 hover:text-blue-800"
              aria-label="Näytä profiilitiedot"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          
          {/* This conditional block renders the profile details when showProfileDetails is true. */}
          {showProfileDetails && (
            <div className="mt-3 p-3 bg-white rounded border border-blue-100">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Ikäryhmä:</strong> {getAgeGroupDisplay(profile.ageGroup)}
              </p>
              
              {profile.lifestyle.length > 0 && (
                <div className="text-sm text-gray-700 mb-2">
                  <strong>Elämäntavat:</strong>
                  <ul className="ml-4 mt-1">
                    {profile.lifestyle.map(factor => (
                      <li key={factor} className="list-disc">
                        {getLifestyleDisplay(factor)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {profile.healthConditions.length > 0 && (
                <div className="text-sm text-gray-700">
                  <strong>Terveydentila:</strong>
                  <ul className="ml-4 mt-1">
                    {profile.healthConditions.map(condition => (
                      <li key={condition} className="list-disc">
                        {getHealthConditionDisplay(condition)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <p className="text-sm text-blue-800">
            Näet vain sinulle oleelliset ohjeet ja suositukset perustuen antamiisi tietoihin.
          </p>
        </div>
        
        {/* The main toggle button that switches between personalized and all content, with conditional text and icon. */}
        {onToggleView && (
          <button
            onClick={handleToggleView}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
            aria-label={showAllContent ? "Näytä vain personoitu sisältö" : "Näytä kaikki sisältö"}
          >
            {showAllContent ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="text-sm">Näytä vain minulle</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="text-sm">Näytä kaikki</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PersonalizationIndicator;