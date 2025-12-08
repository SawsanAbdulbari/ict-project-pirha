// This file provides utilities for managing and persisting application data in `localStorage`.
// It handles user data, survey answers, and progress tracking.

// This object centralizes all the keys used for `localStorage` to prevent typos and manage them easily.
const STORAGE_KEYS = {
  USER_DATA: 'pirha_user_data',
  SURVEY_ANSWERS: 'pirha_survey_answers',
  PROGRESS: 'pirha_progress',
  VISITED_SECTIONS: 'pirha_visited_sections',
  PREFERENCES: 'pirha_preferences',
  SESSION_ID: 'pirha_session_id'
};

// This function creates unique session identifiers.
const generateSessionId = () => {
  return `pirha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// This function ensures a unique session ID is available, creating one if it doesn't exist.
export const getSessionId = () => {
  let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }
  return sessionId;
};

// This function saves survey answers to local storage. It handles JSON.stringify and includes metadata.
export const saveSurveyAnswers = (answers) => {
  try {
    const sessionId = getSessionId();
    const data = {
      answers,
      timestamp: new Date().toISOString(),
      sessionId,
      version: '1.0'
    };
    localStorage.setItem(STORAGE_KEYS.SURVEY_ANSWERS, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    console.error('Error saving survey answers:', error);
    return { success: false, error: error.message };
  }
};

// This function loads survey answers from local storage. It handles JSON.parse and gracefully returns null if data is not found or parsing fails.
export const loadSurveyAnswers = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SURVEY_ANSWERS);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    return parsed.answers || null;
  } catch (error) {
    console.error('Error loading survey answers:', error);
    return null;
  }
};

// This function saves user progress through sections.
export const saveProgress = (currentSection, completedSections = []) => {
  try {
    const sessionId = getSessionId();
    const progress = {
      currentSection,
      completedSections: [...new Set(completedSections)], // Remove duplicates
      lastUpdated: new Date().toISOString(),
      sessionId,
      totalSections: 5 // movement, nutrition, mental_wellbeing, substance_use, other_diseases
    };
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    return { success: true };
  } catch (error) {
    console.error('Error saving progress:', error);
    return { success: false, error: error.message };
  }
};

// This function loads user progress from local storage.
export const loadProgress = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading progress:', error);
    return null;
  }
};

// This function marks a section as visited in local storage.
export const markSectionVisited = (sectionKey) => {
  try {
    const visited = getVisitedSections();
    const updatedVisited = [...new Set([...visited, sectionKey])];
    
    const data = {
      sections: updatedVisited,
      lastUpdated: new Date().toISOString(),
      sessionId: getSessionId()
    };
    
    localStorage.setItem(STORAGE_KEYS.VISITED_SECTIONS, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    console.error('Error marking section as visited:', error);
    return { success: false, error: error.message };
  }
};

// This function retrieves the list of visited sections from local storage.
export const getVisitedSections = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VISITED_SECTIONS);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return parsed.sections || [];
  } catch (error) {
    console.error('Error loading visited sections:', error);
    return [];
  }
};

// This function saves user preferences to local storage.
export const savePreferences = (preferences) => {
  try {
    const data = {
      ...preferences,
      lastUpdated: new Date().toISOString(),
      sessionId: getSessionId()
    };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    console.error('Error saving preferences:', error);
    return { success: false, error: error.message };
  }
};

// This function loads user preferences from local storage.
export const loadPreferences = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading preferences:', error);
    return null;
  }
};

// This function saves complete user data to local storage.
export const saveUserData = (userData) => {
  try {
    const sessionId = getSessionId();
    const data = {
      ...userData,
      sessionId,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    console.error('Error saving user data:', error);
    return { success: false, error: error.message };
  }
};

// This function loads complete user data from local storage.
export const loadUserData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
};

// This function removes all application-related data from `localStorage`.
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return { success: true };
  } catch (error) {
    console.error('Error clearing data:', error);
    return { success: false, error: error.message };
  }
};

// This function provides insights into `localStorage` usage, detailing sizes for each key and overall.
export const getStorageStats = () => {
  try {
    const stats = {};
    let totalSize = 0;
    
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const data = localStorage.getItem(key);
      const size = data ? new Blob([data]).size : 0;
      stats[name] = {
        key,
        exists: !!data,
        size: size,
        sizeKB: (size / 1024).toFixed(2)
      };
      totalSize += size;
    });
    
    return {
      individual: stats,
      total: {
        size: totalSize,
        sizeKB: (totalSize / 1024).toFixed(2),
        sizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return null;
  }
};

// This function checks for any existing application data.
export const hasStoredData = () => {
  return Object.values(STORAGE_KEYS).some(key => 
    localStorage.getItem(key) !== null
  );
};

// This function generates a comprehensive JSON string of all stored data for backup.
export const exportUserData = () => {
  try {
    const allData = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const data = localStorage.getItem(key);
      if (data) {
        allData[name] = JSON.parse(data);
      }
    });
    
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: allData
    };
    
    return {
      success: true,
      data: JSON.stringify(exportData, null, 2)
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    return { success: false, error: error.message };
  }
};

// This function restores application data from a previously exported JSON string, including validation and clearing existing data first.
export const importUserData = (exportedData) => {
  try {
    const parsed = JSON.parse(exportedData);
    
    if (!parsed.data) {
      throw new Error('Invalid export data format');
    }
    
    // Clear existing data first
    clearAllData();
    
    // Import each data type
    Object.entries(parsed.data).forEach(([name, data]) => {
      const key = STORAGE_KEYS[name];
      if (key && data) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error importing user data:', error);
    return { success: false, error: error.message };
  }
};

// This crucial function checks if `localStorage` is accessible and usable in the current browser environment.
export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.warn('localStorage is not available:', error);
    return false;
  }
};

// This array defines the structure and options for the initial user survey.
const surveyQuestions = [
  {
    id: 'age',
    title: 'Ikäryhmä',
    description: 'Valitse ikäryhmäsi',
    options: [
      { id: 'under_65', label: 'Alle 65 vuotta' },
      { id: 'over_65', label: '65 vuotta tai yli' }
    ]
  },
  {
    id: 'lifestyle',
    title: 'Elämäntavat',
    description: 'Valitse kaikki sinuun sopivat vaihtoehdot',
    multiple: true,
    options: [
      { id: 'smoking', label: 'Tupakoin' },
      { id: 'alcohol', label: 'Käytän alkoholia säännöllisesti' },
      { id: 'substance', label: 'Käytän muita päihteitä' },
      { id: 'low_activity', label: 'Liikun vähän' }
    ]
  },
  {
    id: 'health_conditions',
    title: 'Terveydentila',
    description: 'Valitse kaikki sinuun sopivat vaihtoehdot',
    multiple: true,
    options: [
      { id: 'diabetes', label: 'Diabetes' },
      { id: 'sleep_apnea', label: 'Uniapnea' },
      { id: 'heart_disease', label: 'Sydänsairaus' },
      { id: 'mental_health', label: 'Mielenterveyden haasteet' }
    ]
  }
];

// This object maps content categories to their relevance criteria, used for personalization.
const contentSections = {
  movement: {
    title: 'Liikkuminen',
    relevantFor: ['all']
  },
  nutrition: {
    title: 'Ravitsemus',
    relevantFor: ['all']
  },
  mental_wellbeing: {
    title: 'Henkinen jaksaminen',
    relevantFor: ['all', 'mental_health']
  },
  substance_use: {
    title: 'Päihteiden käyttö',
    relevantFor: ['smoking', 'alcohol', 'substance']
  },
  other_diseases: {
    title: 'Muiden sairauksien huomiointi',
    relevantFor: ['diabetes', 'sleep_apnea', 'heart_disease']
  }
};
// This complex function calculates the overall completion progress of the user.
// It takes into account both survey completion and the percentage of personalized content sections visited.
export const calculateCompletionPercentage = () => {
  const surveyAnswers = loadSurveyAnswers() || {};
  const visitedSections = getVisitedSections() || [];

  // 1. Calculate survey completion
  const answeredQuestions = Object.keys(surveyAnswers).filter(key => {
    const answer = surveyAnswers[key];
    if (Array.isArray(answer)) {
      return answer.length > 0;
    }
    return !!answer;
  }).length;
  const surveyCompletion = (answeredQuestions / surveyQuestions.length) * 100;

  // 2. Determine personalized sections
  const allAnswers = Object.values(surveyAnswers).flat();
  const personalizedSections = Object.keys(contentSections).filter(key => {
    const section = contentSections[key];
    return section.relevantFor.includes('all') ||
           section.relevantFor.some(condition => allAnswers.includes(condition));
  });

  // 3. Calculate section completion
  const visitedPersonalizedSections = visitedSections.filter(section => personalizedSections.includes(section));
  const sectionCompletion = personalizedSections.length > 0
    ? (visitedPersonalizedSections.length / personalizedSections.length) * 100
    : 0;

  // 4. Combine scores (e.g., 50% for survey, 50% for sections)
  const totalCompletion = (surveyCompletion * 0.5) + (sectionCompletion * 0.5);

  return Math.min(Math.round(totalCompletion), 100);
};

// This function gathers various metrics to construct a high-level overview of the user's engagement with the application.
export const getUserJourney = () => {
  try {
    const surveyData = localStorage.getItem(STORAGE_KEYS.SURVEY_ANSWERS);
    const progressData = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    const visitedData = localStorage.getItem(STORAGE_KEYS.VISITED_SECTIONS);
    
    const journey = {
      startDate: null,
      lastActivity: null,
      sessionsCount: 1,
      completionPercentage: calculateCompletionPercentage(),
      sectionsVisited: getVisitedSections().length,
      surveyCompleted: !!surveyData,
      timeSpent: null // Could be calculated with more detailed tracking
    };
    
    // Find earliest activity
    const timestamps = [];
    if (surveyData) {
      const parsed = JSON.parse(surveyData);
      if (parsed.timestamp) timestamps.push(new Date(parsed.timestamp));
    }
    if (progressData) {
      const parsed = JSON.parse(progressData);
      if (parsed.lastUpdated) timestamps.push(new Date(parsed.lastUpdated));
    }
    if (visitedData) {
      const parsed = JSON.parse(visitedData);
      if (parsed.lastUpdated) timestamps.push(new Date(parsed.lastUpdated));
    }
    
    if (timestamps.length > 0) {
      journey.startDate = new Date(Math.min(...timestamps)).toISOString();
      journey.lastActivity = new Date(Math.max(...timestamps)).toISOString();
    }
    
    return journey;
  } catch (error) {
    console.error('Error getting user journey:', error);
    return null;
  }
};