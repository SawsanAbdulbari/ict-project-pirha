// This component is the main page for displaying all the content sections.
// It personalizes the content based on the user's survey answers.
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Brain, Heart, Cigarette, Wine, Stethoscope, CheckCircle, Star, User } from "lucide-react";
import { getUserProfile, getContentFlags, getUserRiskFactors } from "../utils/userProfile";
import PersonalizationIndicator from "../components/PersonalizationIndicator";

const AllContentPage = () => {
  // This hook is used to navigate between pages.
  const navigate = useNavigate();
  // This state variable stores the sections that the user has visited.
  const [visitedSections, setVisitedSections] = useState([]);
  // This state variable stores the user's profile information.
  const [userProfile, setUserProfile] = useState(null);
  // This state variable stores the content flags, which determine what content to show the user.
  const [contentFlags, setContentFlags] = useState(null);
  // This state variable stores the user's risk factors.
  const [riskFactors, setRiskFactors] = useState([]);
  // This state variable determines whether to show all the content or just the personalized content.
  const [showAllContent, setShowAllContent] = useState(false);

  useEffect(() => {
    // Load user profile
    const profile = getUserProfile();
    const flags = getContentFlags();
    const risks = getUserRiskFactors();
    
    setUserProfile(profile);
    setContentFlags(flags);
    setRiskFactors(risks);
    setShowAllContent(flags?.showAllContent || false);

    // Load visited sections
    const visited = JSON.parse(localStorage.getItem("pirha_visited_sections") || '{"sections":[]}');
    setVisitedSections(visited.sections || []);
  }, []);
  // This function is called when the user toggles the view between personalized and all content.
  const handleToggleView = (showAll) => {
    setShowAllContent(showAll);
  };

  // Decide relevance for each section
  const getSectionRelevance = (sectionId) => {
    // If the user has not completed the survey or wants to see all the content, all sections are relevant.
    if (!userProfile?.hasCompletedSurvey || showAllContent) return 'all';
    
    switch(sectionId) {
      // The movement section is very relevant if the user has low activity.
      case 'movement':
        return userProfile.lifestyle.includes('low_activity') ? 'high' : 'normal';
      // The nutrition section is highly relevant if the user has diabetes or heart disease.
      case 'nutrition':
        return userProfile.healthConditions.includes('diabetes') || 
               userProfile.healthConditions.includes('heart_disease') ? 'high' : 'normal';
      // The mental wellbeing section is highly relevant if the user has mental health issues.
      case 'mental':
        return userProfile.healthConditions.includes('mental_health') ? 'high' : 'normal';
      // The substance use section is not applicable if the user does not smoke, drink alcohol or use drugs.
      case 'substance':
        if (!userProfile.lifestyle.includes('smoking') && !userProfile.lifestyle.includes('alcohol')) {
          return 'not-applicable';
        }
        return 'high';
      // The other diseases section is not applicable if the user has no health conditions.
      case 'diseases':
        if (userProfile.healthConditions.length === 0) {
          return 'not-applicable';
        }
        return 'high';
      default:
        return 'normal';
    }
  };
  // This array contains all the content sections.
  const sections = [
    {
      id: "movement",
      title: "Liikkuminen",
      description: "Fyysisen toimintakyvyn ylläpitäminen ja parantaminen",
      icon: Activity,
      path: "/movement",
      color: "blue",
      relevance: getSectionRelevance('movement'),
      personalizedNote: userProfile?.lifestyle?.includes('low_activity') ? 
        "Erityisen tärkeä sinulle - vähäinen liikunta" : 
        "Liikunta tukee toipumista"
    },
    {
      id: "nutrition",
      title: "Ravitsemus",
      description: "Hyvä ravitsemus tukee toipumista",
      icon: Heart,
      path: "/nutrition",
      color: "green",
      relevance: getSectionRelevance('nutrition'),
      personalizedNote: userProfile?.healthConditions?.includes('diabetes') ? 
        "Diabeteksen erityisruokavalio" : 
        userProfile?.ageGroup === 'over_65' ? 
        "Ikääntyneiden proteiinin tarve" : 
        "Monipuolinen ravitsemus"
    },
    {
      id: "mental",
      title: "Henkinen jaksaminen",
      description: "Stressinhallinta ja mielenterveyden tukeminen",
      icon: Brain,
      path: "/mental-wellbeing",
      color: "purple",
      relevance: getSectionRelevance('mental'),
      personalizedNote: userProfile?.healthConditions?.includes('mental_health') ? 
        "Mielenterveyden tuki tärkeää" : 
        "Stressinhallinta auttaa toipumisessa"
    },
    {
      id: "substance",
      title: "Päihteiden käyttö",
      description: "Tupakoinnin ja alkoholin vaikutukset toipumiseen",
      icon: userProfile?.lifestyle?.includes('smoking') ? Cigarette : Wine,
      path: "/substance-use",
      color: "orange",
      relevance: getSectionRelevance('substance'),
      personalizedNote: userProfile?.lifestyle?.includes('smoking') ? 
        "Tupakoinnin lopettaminen kriittistä" : 
        userProfile?.lifestyle?.includes('alcohol') ? 
        "Alkoholin vähentäminen tärkeää" : 
        "Ei koske sinua"
    },
    {
      id: "diseases",
      title: "Muut sairaudet",
      description: "Sairauksien hallinta ennen toimenpidettä",
      icon: Stethoscope,
      path: "/other-diseases",
      color: "red",
      relevance: getSectionRelevance('diseases'),
      personalizedNote: userProfile?.healthConditions?.length > 0 ? 
        `${userProfile.healthConditions.length} sairautta vaatii huomiota` : 
        "Ei erityisiä sairauksia"
    },
  ];

  // Filter sections based on personalization settings
  const displaySections = showAllContent ? sections : 
    sections.filter(s => s.relevance !== 'not-applicable' || visitedSections.includes(s.id));

  // Sort sections by relevance if personalized
  const sortedSections = userProfile?.hasCompletedSurvey && !showAllContent ? 
    [...displaySections].sort((a, b) => {
      const relevanceOrder = { 'high': 0, 'normal': 1, 'not-applicable': 2 };
      return relevanceOrder[a.relevance] - relevanceOrder[b.relevance];
    }) : displaySections;
  // This function calculates the user's overall progress.
  const calculateOverallProgress = () => {
    if (sortedSections.length === 0) return 0;
    const visitedCount = sortedSections.filter(section => 
      visitedSections.includes(section.id)
    ).length;
    return Math.round((visitedCount / sortedSections.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kaikki sisällöt</h1>
          <p className="text-gray-600 mb-4">
            {userProfile?.hasCompletedSurvey && !showAllContent ? 
              "Näet sisällöt järjestettynä tärkeyden mukaan perustuen profiiliisi" :
              "Selaa kaikkia saatavilla olevia sisältöjä"}
          </p>

          {/* Personalization Indicator */}
          {userProfile?.hasCompletedSurvey && (
            <PersonalizationIndicator onToggleView={handleToggleView} />
          )}

          {/* Overall progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Kokonaisedistyminen</span>
              <span>{calculateOverallProgress()}% valmis</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateOverallProgress()}%` }}
              />
            </div>
          </div>

          {/* Risk factors summary */}
          {userProfile?.hasCompletedSurvey && !showAllContent && riskFactors.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-semibold text-yellow-900 mb-1">
                Sinulla on {riskFactors.length} riskitekijää:
              </p>
              <p className="text-xs text-yellow-800">
                {riskFactors.map(r => r.factor).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Content sections */}
        <div className="space-y-4">
          {sortedSections.map((section) => {
            const Icon = section.icon;
            const isVisited = visitedSections.includes(section.id);
            const isHighPriority = section.relevance === 'high';
            const isNotApplicable = section.relevance === 'not-applicable';
            
            return (
              <div
                key={section.id}
                onClick={() => navigate(section.path)}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
                  isHighPriority && !showAllContent ? 'ring-2 ring-red-400' : ''
                } ${isNotApplicable && !showAllContent ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <div className={`p-3 bg-${section.color}-100 rounded-lg mr-4`}>
                      <Icon className={`w-6 h-6 text-${section.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                        {isHighPriority && !showAllContent && (
                          <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                            Tärkeä sinulle
                          </span>
                        )}
                        {isNotApplicable && !showAllContent && (
                          <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            Ei koske sinua
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{section.description}</p>
                      
                      {/* Personalized note */}
                      {userProfile?.hasCompletedSurvey && !showAllContent && (
                        <p className="text-sm text-blue-600 italic">
                          → {section.personalizedNote}
                        </p>
                      )}
                      
                      <div className="flex items-center mt-3">
                        {isVisited ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-5 h-5 mr-1" />
                            <span className="text-sm">Vierailtu</span>
                          </div>
                        ) : (
                          <div className="text-blue-600 text-sm font-medium">
                            Klikkaa avataksesi →
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show hidden sections notice */}
        {userProfile?.hasCompletedSurvey && !showAllContent && 
         sections.some(s => s.relevance === 'not-applicable') && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">
              Joitakin sisältöjä on piilotettu, koska ne eivät koske sinua.
            </p>
            <button
              onClick={() => setShowAllContent(true)}
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Näytä kaikki sisällöt
            </button>
          </div>
        )}

        {/* Next steps */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <h2 className="text-xl font-semibold mb-3">Seuraavat askeleesi</h2>
          <ol className="space-y-2 text-sm">
            {userProfile?.hasCompletedSurvey && !showAllContent ? (
              <>
                <li>1. Käy läpi kaikki "Tärkeä sinulle" -merkityt osiot</li>
                <li>2. Lataa henkilökohtaiset PDF-oppaat jokaisesta osiosta</li>
                <li>3. Tee harjoitukset ja seuraa edistymistäsi</li>
                <li>4. Palaa tarkistamaan ohjeet ennen toimenpidettä</li>
              </>
            ) : (
              <>
                <li>1. Tutustu kaikkiin sisältöihin</li>
                <li>2. Lataa tarvitsemasi PDF-oppaat</li>
                <li>3. Seuraa edistymistäsi</li>
                <li>4. Valmistaudu toimenpiteeseen</li>
              </>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AllContentPage;