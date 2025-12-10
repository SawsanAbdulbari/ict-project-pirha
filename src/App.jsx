import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { ArrowRight, Heart, Activity, Brain, Cigarette, Wine, Stethoscope, RotateCcw, Save, BarChart3, User, ExternalLink, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Import existing components
import Header from './components/Header.jsx';
import MovementPage from './components/MovementPage.jsx';
import NutritionPage from './components/NutritionPage.jsx';
import MentalWellbeingPage from './components/MentalWellbeingPage.jsx';
import LoginPage from './components/LoginPage.jsx';
import ProfilePage from './components/ProfilePage.jsx';

// Import new components
import SubstanceUsePage from './components/SubstanceUsePage.jsx';
import OtherDiseasesPage from './components/OtherDiseasesPage.jsx';
import ErrorBoundary, { SectionErrorBoundary, useErrorReporting } from './components/ErrorBoundary.jsx';
import ProgressTracker, { MiniProgressBar, ProgressBadge } from './components/ProgressTracker.jsx';

// Import utilities
import { downloadPDF, FORM_TYPES } from './utils/pdfGenerator.js';
import { 
  saveSurveyAnswers, 
  loadSurveyAnswers, 
  saveProgress, 
  loadProgress, 
  markSectionVisited, 
  getVisitedSections,
  calculateCompletionPercentage,
  isStorageAvailable,
  clearAllData,
  getUserJourney
} from './utils/dataStorage.js';

import './App.css';

// Survey questions configuration
const surveyQuestions = (t) => [
  {
    id: 'age',
    title: t('age_group_title'),
    description: t('age_group_description'),
    options: [
      { id: 'under_65', label: t('under_65'), icon: Activity },
      { id: 'over_65', label: t('over_65'), icon: Heart }
    ]
  },
  {
    id: 'lifestyle',
    title: t('lifestyle_title'),
    description: t('lifestyle_description'),
    multiple: true,
    options: [
      { id: 'smoking', label: t('smoking'), icon: Cigarette },
      { id: 'alcohol', label: t('alcohol'), icon: Wine },
      { id: 'substance', label: t('substance'), icon: Brain },
      { id: 'low_activity', label: t('low_activity'), icon: Activity }
    ]
  },
  {
    id: 'health_conditions',
    title: t('health_conditions_title'),
    description: t('health_conditions_description'),
    multiple: true,
    options: [
      { id: 'diabetes', label: t('diabetes'), icon: Stethoscope },
      { id: 'sleep_apnea', label: t('sleep_apnea'), icon: Brain },
      { id: 'heart_disease', label: t('heart_disease'), icon: Heart },
      { id: 'mental_health', label: t('mental_health'), icon: Brain }
    ]
  }
];

// Content sections mapping
const contentSections = {
  movement: {
    title: 'Liikkuminen',
    icon: Activity,
    description: 'Fyysisen toimintakyvyn ylläpitäminen ja parantaminen',
    relevantFor: ['all']
  },
  nutrition: {
    title: 'Ravitsemus',
    icon: Heart,
    description: 'Hyvä ravitsemustila tukee toipumista',
    relevantFor: ['all']
  },
  mental_wellbeing: {
    title: 'Henkinen jaksaminen',
    icon: Brain,
    description: 'Psyykkinen hyvinvointi ja stressin hallinta',
    relevantFor: ['all', 'mental_health']
  },
  substance_use: {
    title: 'Päihteiden käyttö',
    icon: Cigarette,
    description: 'Tupakoinnin ja alkoholin käytön vaikutukset',
    relevantFor: ['smoking', 'alcohol', 'substance']
  },
  other_diseases: {
    title: 'Muiden sairauksien huomiointi',
    icon: Stethoscope,
    description: 'Olemassa olevien sairauksien hallinta',
    relevantFor: ['diabetes', 'sleep_apnea', 'heart_disease']
  }
};

const sectionToFormType = {
  movement: FORM_TYPES.EXERCISE_PLAN,
  nutrition: FORM_TYPES.NUTRITION_PLAN,
  mental_wellbeing: FORM_TYPES.MENTAL_WELLBEING,
  substance_use: FORM_TYPES.SUBSTANCE_PLAN,
  other_diseases: FORM_TYPES.DISEASE_MANAGEMENT,
};

function App() {
  const { t } = useTranslation();
  const mainContentRef = React.useRef(null);
  // Core state
  const [currentStep, setCurrentStep] = useState('welcome');
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [selectedSections, setSelectedSections] = useState([]);
  const [user, setUser] = useState(null);
  
  // Progress tracking state
  const [visitedSections, setVisitedSections] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  
  // Error reporting hook
  const { reportError } = useErrorReporting();
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        setIsDesktop(width >= 768);
      }
    });

    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Load saved data on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Check if localStorage is available
        if (!isStorageAvailable()) {
          console.warn('localStorage not available, using session-only storage');
        }

        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            setUser(loggedInUser);
        }
        
        // Load saved survey answers
        const savedAnswers = loadSurveyAnswers();
        if (savedAnswers) {
          setSurveyAnswers(savedAnswers);
        }
        
        // Load progress
        const savedProgress = loadProgress();
        if (savedProgress) {
          setCurrentStep(savedProgress.currentSection || 'welcome');
        }
        
        // Load visited sections
        const visited = getVisitedSections();
        setVisitedSections(visited);
        
        // Calculate completion percentage
        const completion = calculateCompletionPercentage();
        setCompletionPercentage(completion);
        
        // Show progress if user has started
        if (visited.length > 0 || Object.keys(savedAnswers || {}).length > 0) {
          setShowProgress(true);
        }
        
      } catch (error) {
        console.error('Error initializing app:', error);
        reportError(error, { context: 'app_initialization' });
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []); // Empty dependency array - only run once on mount

  // Update completion percentage when visited sections change
  useEffect(() => {
    const completion = calculateCompletionPercentage();
    setCompletionPercentage(completion);
  }, [visitedSections, surveyAnswers]);

  // Save survey answers when they change
  useEffect(() => {
    if (Object.keys(surveyAnswers).length > 0) {
      const result = saveSurveyAnswers(surveyAnswers);
      if (result.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      }
    }
  }, [surveyAnswers]);

  // Scroll to top on page change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
    window.scrollTo(0, 0);
  }, [currentStep]);

    const handleLogin = (username) => {
        setUser(username);
        localStorage.setItem('user', username);
        setCurrentStep('welcome');
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setCurrentStep('welcome');
    };

  // Handle navigation with progress tracking
  const navigateToSection = (sectionKey) => {
    try {
      // Mark section as visited
      markSectionVisited(sectionKey);
      setVisitedSections(prev => [...new Set([...prev, sectionKey])]);
      
      // Save progress
      saveProgress(sectionKey, [...visitedSections, sectionKey]);
      
      // Navigate
      setCurrentStep(sectionKey);
      setShowProgress(true);
    } catch (error) {
      console.error('Error navigating to section:', error);
      reportError(error, { context: 'navigation', sectionKey });
    }
  };

  const handleSurveyAnswer = (questionId, optionId, isMultiple = false) => {
    try {
      setSurveyAnswers(prev => {
        if (isMultiple) {
          const currentAnswers = prev[questionId] || [];
          const newAnswers = currentAnswers.includes(optionId)
            ? currentAnswers.filter(id => id !== optionId)
            : [...currentAnswers, optionId];
          return { ...prev, [questionId]: newAnswers };
        } else {
          return { ...prev, [questionId]: optionId };
        }
      });
    } catch (error) {
      console.error('Error handling survey answer:', error);
      reportError(error, { context: 'survey_answer', questionId, optionId });
    }
  };

  const handleDownloadForm = async (sectionKey) => {
    const formType = sectionToFormType[sectionKey];
    try {
      // Get user data from survey answers for personalized forms
      const userData = {
        age: surveyAnswers.age === 'over_65' ? 'over_65' : 'under_65',
        smoking: (surveyAnswers.lifestyle || []).includes('smoking'),
        alcohol: (surveyAnswers.lifestyle || []).includes('alcohol'),
        conditions: surveyAnswers.health_conditions || []
      };
      
      const result = await downloadPDF(formType, userData);
      
      if (result.success) {
        setSaveStatus('downloaded');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        console.warn('PDF download failed, used fallback:', result.error);
        setSaveStatus('fallback');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      console.error('Error downloading form:', error);
      reportError(error, { context: 'download_form', formType });
    }
  };

  const generatePersonalizedSections = () => {
    try {
      const allAnswers = Object.values(surveyAnswers).flat();
      const relevant = Object.entries(contentSections).filter(([key, section]) => {
        return section.relevantFor.includes('all') || 
               section.relevantFor.some(condition => allAnswers.includes(condition));
      });
      setSelectedSections(relevant.map(([key]) => key));
      
      // Mark survey as completed
      markSectionVisited('survey');
      setVisitedSections(prev => [...new Set([...prev, 'survey'])]);
      
      navigateToSection('results');
    } catch (error) {
      console.error('Error generating personalized sections:', error);
      reportError(error, { context: 'personalized_sections' });
    }
  };

  const handleResetProgress = () => {
    try {
      if (window.confirm(t('reset_confirmation'))) {
        clearAllData();
        setSurveyAnswers({});
        setSelectedSections([]);
        setVisitedSections([]);
        setCompletionPercentage(0);
        setCurrentStep('welcome');
        setShowProgress(false);
        setSaveStatus('reset');
        setTimeout(() => setSaveStatus(null), 2000);
      }
    } catch (error) {
      console.error('Error resetting progress:', error);
      reportError(error, { context: 'reset_progress' });
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading_app')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }



  

  const SurveyPage = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900">{t('survey_title')}</CardTitle>
          <CardDescription>
            {t('survey_subtitle')}
            {saveStatus === 'saved' && (
              <span className="ml-2 text-green-600">• {t('saved_automatically')}</span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {surveyQuestions(t).map((question) => (
          <SectionErrorBoundary key={question.id} sectionName={`Kysymys: ${question.title}`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{question.title}</CardTitle>
                <CardDescription>{question.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.options.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = question.multiple 
                      ? (surveyAnswers[question.id] || []).includes(option.id)
                      : surveyAnswers[question.id] === option.id;

                    return (
                      <Button
                        key={option.id}
                        variant="outline"
                        className={`w-full h-auto p-4 rounded-lg cursor-pointer transition-all justify-start text-left ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 text-blue-900' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25 text-gray-900'
                        }`}
                        onClick={() => handleSurveyAnswer(question.id, option.id, question.multiple)}
                      >
                        <div className="flex items-center space-x-3 pointer-events-none">
                          <Checkbox checked={isSelected} readOnly aria-hidden="true" />
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">{option.label}</span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </SectionErrorBoundary>
        ))}
      </div>

      <div className="flex justify-between">
                <Button
                  onClick={() => setCurrentStep('welcome')}
                  variant="outline"
                >
                  {t('back')}
                </Button>        <Button 
          onClick={generatePersonalizedSections}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={Object.keys(surveyAnswers).length === 0}
        >
          {t('show_personalized_guidance')}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const ResultsPage = () => (
    <div className="space-y-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">Sinulle sopivat ohjeet</CardTitle>
            <CardDescription>
              Kyselyn perusteella valitut sisältöalueet
            </CardDescription>
          </CardHeader>
        </Card>

        <ul className={`grid ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'} gap-6 mb-8`}>
          {selectedSections.map((sectionKey) => {
            const section = contentSections[sectionKey];
            const IconComponent = section.icon;
            const isVisited = visitedSections.includes(sectionKey);
            
            return (
              <li key={sectionKey}>
                <SectionErrorBoundary sectionName={section.title}>
                  <Card className={`hover:shadow-lg transition-shadow ${
                    isVisited ? 'border-green-200 bg-green-50' : ''
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{section.title}</CardTitle>
                          </div>
                        </div>
                        {isVisited && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Vierailtu
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{section.description}</p>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => navigateToSection(sectionKey)}
                        >
                          Lue lisää
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadForm(sectionKey)}
                        >
                          Lataa lomake
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </SectionErrorBoundary>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-between">
          <Button 
            onClick={() => setCurrentStep('survey')}
            variant="outline"
          >
            Takaisin kyselyyn
          </Button>
          <Button 
            onClick={() => navigateToSection('all_content')}
            variant="outline"
          >
            Tutustu kaikkeen sisältöön
          </Button>
        </div>
      </div>
  );

  const AllContentPage = () => (
    <div className="space-y-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">Kaikki sisältö</CardTitle>
            <CardDescription>
              Tutustu kaikkiin kuntoutumisoppaan osa-alueisiin
            </CardDescription>
          </CardHeader>
        </Card>

        <ul className={`grid ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'} gap-6 mb-8`}>
          {Object.entries(contentSections).map(([sectionKey, section]) => {
            const IconComponent = section.icon;
            const isVisited = visitedSections.includes(sectionKey);
            
            return (
              <li key={sectionKey}>
                <SectionErrorBoundary sectionName={section.title}>
                  <Card className={`hover:shadow-lg transition-shadow ${
                    isVisited ? 'border-green-200 bg-green-50' : ''
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{section.title}</CardTitle>
                          </div>
                        </div>
                        {isVisited && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Vierailtu
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{section.description}</p>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => navigateToSection(sectionKey)}
                        >
                          Lue lisää
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadForm(sectionKey)}
                        >
                          Lataa lomake
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </SectionErrorBoundary>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-center">
          <Button 
            onClick={() => setCurrentStep('welcome')}
            variant="outline"
          >
            Takaisin etusivulle
          </Button>
        </div>
      </div>
  );

  

  const renderPageContent = (step, commonProps) => {
    switch (step) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'profile':
        return <ProfilePage user={user} onLogout={handleLogout} onBack={() => setCurrentStep('welcome')} navigateTo={navigateToSection} />;
      case 'survey':
        return <SurveyPage />;
      case 'results':
        return <ResultsPage />;
      case 'all_content':
        return <AllContentPage />;
      case 'movement':
        return (
          <SectionErrorBoundary sectionName="Liikkuminen">
            <MovementPage {...commonProps} />
          </SectionErrorBoundary>
        );
      case 'nutrition':
        return (
          <SectionErrorBoundary sectionName="Ravitsemus">
            <NutritionPage {...commonProps} />
          </SectionErrorBoundary>
        );
      case 'mental_wellbeing':
        return (
          <SectionErrorBoundary sectionName="Henkinen jaksaminen">
            <MentalWellbeingPage {...commonProps} />
          </SectionErrorBoundary>
        );
      case 'substance_use':
        return (
          <SectionErrorBoundary sectionName="Päihteiden käyttö">
            <SubstanceUsePage {...commonProps} />
          </SectionErrorBoundary>
        );
      case 'other_diseases':
        return (
          <SectionErrorBoundary sectionName="Muiden sairauksien huomiointi">
            <OtherDiseasesPage {...commonProps} />
          </SectionErrorBoundary>
        );
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-screen-xl w-full mx-auto">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-blue-900 mb-2">
              {t('welcome_title')}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              {t('welcome_subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && <p className="text-center text-gray-700 font-medium mb-4">{t('welcome_user', { user })}</p>}
            <p className="text-gray-700 leading-relaxed text-base">
              {t('welcome_text')}
            </p>
            <p className="text-gray-700 leading-relaxed mt-4 text-base">
              {t('welcome_intro_1')}
            </p>
            <p className="text-blue-800 font-semibold leading-relaxed mt-2 text-lg">
              {t('welcome_intro_2')}
            </p>
            <p className="text-gray-700 leading-relaxed mt-4 text-base">
              {t('welcome_intro_3')}
            </p>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {[
                { title: t('section_movement'), icon: Activity, color: "blue" },
                { title: t('section_nutrition'), icon: Heart, color: "green" },
                { title: t('section_mental'), icon: Brain, color: "purple" },
                { title: t('section_substances'), icon: Cigarette, color: "red" },
                { title: t('section_diseases'), icon: Stethoscope, color: "gray" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index} className={`p-4 rounded-lg bg-${item.color}-100 flex items-center`}>
                    <Icon className={`w-6 h-6 mr-3 text-${item.color}-700`} />
                    <span className={`font-semibold text-${item.color}-800`}>{item.title}</span>
                  </li>
                );
              })}
            </ul>
            
            {/* Save status indicator */}
            {saveStatus && (
              <div role="status" className={`p-3 rounded-lg text-sm ${
                saveStatus === 'saved' ? 'bg-green-50 text-green-700' :
                saveStatus === 'downloaded' ? 'bg-blue-50 text-blue-700' :
                saveStatus === 'fallback' ? 'bg-orange-50 text-orange-700' :
                'bg-gray-50 text-gray-700'
              }`}>
                {saveStatus === 'saved' && t('data_saved')}
                {saveStatus === 'downloaded' && t('pdf_downloaded')}
                {saveStatus === 'fallback' && t('pdf_fallback')}
                {saveStatus === 'reset' && t('data_reset')}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button 
                onClick={() => navigateToSection('survey')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {Object.keys(surveyAnswers).length > 0 ? t('continue_survey') : t('start_survey')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                onClick={() => navigateToSection('all_content')}
                variant="outline"
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                size="lg"
              >
                {t('browse_all_content')}
              </Button>
            </div>
            
            {/* Online Resources */}
            <div className="p-6 border rounded-lg bg-slate-50 mt-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('online_resources_title')}</h3>
              <p className="text-gray-700 mb-3 text-base">
                {t('online_resources_intro')}
              </p>
              <ul className="space-y-3 text-base">
                <li>
                  <a href="https://www.terveyskyla.fi/leikkaukseen" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                    {t('terveyskyla_surgery_link')} <ExternalLink className="w-4 h-4 ml-1" />
                    <span className="sr-only">{t('opens_in_new_tab')}</span>
                  </a>
                  <p className="text-gray-600 text-sm mt-1 pl-5">
                    {t('terveyskyla_surgery_desc')}
                  </p>
                </li>
                <li>
                  <a href="https://www.terveyskyla.fi/kuntoutumistalo/kuntoutujalle/ravitsemus" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                    {t('terveyskyla_nutrition_link')} <ExternalLink className="w-4 h-4 ml-1" />
                    <span className="sr-only">{t('opens_in_new_tab')}</span>
                  </a>
                  <p className="text-gray-600 text-sm mt-1 pl-5">
                    {t('terveyskyla_nutrition_desc')}
                  </p>
                </li>
                <li>
                  <a href="https://www.terveyskyla.fi/syopatalo" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                    {t('terveyskyla_cancer_link')} <ExternalLink className="w-4 h-4 ml-1" />
                    <span className="sr-only">{t('opens_in_new_tab')}</span>
                  </a>
                  <p className="text-gray-600 text-sm mt-1 pl-5">
                    {t('terveyskyla_cancer_desc')}
                  </p>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="p-6 border rounded-lg bg-slate-50 mt-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('contact_info_title')}</h3>
              <p className="text-gray-700 mb-3 text-base">
                {t('contact_info_intro')}
              </p>
              <ul className="space-y-3 text-base text-gray-700">
                <li>
                  <strong>{t('contact_pirha_exchange')}</strong> {t('contact_pirha_exchange_desc')}
                </li>
                <li>
                  <strong>{t('contact_social_worker')}</strong> <a href="https://www.pirha.fi/palvelut/palveluhakemisto/terveydenhuollon-sosiaalityo" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">{t('contact_social_worker_link')} <ExternalLink className="w-4 h-4 ml-1" /></a>
                </li>
                <li>
                  <strong>{t('contact_guide_authors')}</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                    <li>{t('contact_guide_author_1')} <a href="mailto:maija-liisa.kalliomaki@pirha.fi" className="text-blue-600 hover:underline">maija-liisa.kalliomaki@pirha.fi</a></li>
                    <li>{t('contact_guide_author_2')} <a href="mailto:karita.jappinen@pirha.fi" className="text-blue-600 hover:underline">karita.jappinen@pirha.fi</a></li>
                  </ul>
                </li>
                <li>
                  {t('contact_guide_order')} <a href="https://pirha.mygrano.fi" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">pirha.mygrano.fi <ExternalLink className="w-4 h-4 ml-1" /></a>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
        );
    }
  }

const commonProps = {
      onBack: () => {
        const previousPage = selectedSections.length > 0 ? 'results' : 'all_content';
        setCurrentStep(previousPage);
      },
      onDownload: handleDownloadForm
    };

    const pagesWithSidebar = [
      'survey',
      'results',
      'all_content',
      'movement',
      'nutrition',
      'mental_wellbeing',
      'substance_use',
      'other_diseases',
      'profile'
    ];

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header user={user} onLogout={handleLogout} navigateTo={setCurrentStep} />
      <div className="flex flex-1 p-4 justify-center">
        <div className={`max-w-screen-xl w-full grid ${isDesktop ? 'grid-cols-4' : 'grid-cols-1'} gap-6`}>
          <main ref={mainContentRef} tabIndex="-1" className={`${isDesktop ? (currentStep === 'welcome' || currentStep === 'login' ? 'col-span-4' : 'col-span-3') : 'col-span-1'} focus:outline-none`}>
            {renderPageContent(currentStep, commonProps)}
          </main>
          {pagesWithSidebar.includes(currentStep) && currentStep !== 'welcome' && (
            <aside className="col-span-1">
              <ProgressTracker
                completionPercentage={completionPercentage}
                visitedSections={visitedSections}
                currentSection={currentStep}
                surveyCompleted={Object.keys(surveyAnswers).length > 0}
              />
            </aside>
          )}
        </div>
      </div>    </div>
    </ErrorBoundary>
  );

}

export default App;
