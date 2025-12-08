// This file provides utilities for managing and interpreting user profile data, primarily for content personalization based on survey answers.

/**
 * This is the central function for retrieving the user's saved survey answers and formatting them into a usable profile object.
 */
export const getUserProfile = () => {
  try {
    const surveyData = localStorage.getItem('pirha_survey_answers');
    if (!surveyData) {
      return {
        hasCompletedSurvey: false, // Indicates if the user has completed the initial survey.
        ageGroup: null,
        lifestyle: [],
        healthConditions: [],
        showAllContent: true // Flag to show all content when no survey data.
      };
    }

    const parsed = JSON.parse(surveyData);
    return {
      hasCompletedSurvey: true,
      ageGroup: parsed.answers?.age || null,
      lifestyle: parsed.answers?.lifestyle || [],
      healthConditions: parsed.answers?.health_conditions || [],
      showAllContent: false,
      timestamp: parsed.timestamp,
      sessionId: parsed.sessionId
    };
  } catch (error) {
    console.error('Error parsing user profile:', error);
    return {
      hasCompletedSurvey: false,
      ageGroup: null,
      lifestyle: [],
      healthConditions: [],
      showAllContent: true
    };
  }
};

/**
 * This function provides a convenient way to check for specific user lifestyle attributes without re-parsing the entire profile.
 * @param {string} factor - The lifestyle factor to check (e.g., 'smoking', 'alcohol', 'low_activity')
 * @returns {boolean}
 */
export const hasLifestyleFactor = (factor) => {
  const profile = getUserProfile();
  return profile.lifestyle.includes(factor);
};

/**
 * This function provides a convenient way to check for specific user health conditions without re-parsing the entire profile.
 * @param {string} condition - The health condition to check (e.g., 'diabetes', 'sleep_apnea', 'heart_disease')
 * @returns {boolean}
 */
export const hasHealthCondition = (condition) => {
  const profile = getUserProfile();
  return profile.healthConditions.includes(condition);
};

/**
 * This function provides a convenient way to check for specific user age group without re-parsing the entire profile.
 * @param {string} ageGroup - 'under_65' or 'over_65'
 * @returns {boolean}
 */
export const isInAgeGroup = (ageGroup) => {
  const profile = getUserProfile();
  return profile.ageGroup === ageGroup;
};

/**
 * This function generates a set of boolean flags used to determine which content sections should be displayed to the user based on their profile.
 * @returns {Object} Flags for showing different content sections
 */
export const getContentFlags = () => {
  const profile = getUserProfile();
  
  // If no survey completed, show all content by default.
  if (!profile.hasCompletedSurvey) {
    return {
      showAllContent: true,
      showYoungAdultContent: true,
      showSeniorContent: true,
      showSmokingContent: true,
      showAlcoholContent: true,
      showExerciseContent: true,
      showDiabetesContent: true,
      showSleepApneaContent: true,
      showHeartDiseaseContent: true,
      showMentalHealthContent: true
    };
  }

  // Individual flags are set based on ageGroup, lifestyle, and healthConditions.
  return {
    showAllContent: false,
    showYoungAdultContent: profile.ageGroup === 'under_65',
    showSeniorContent: profile.ageGroup === 'over_65',
    showSmokingContent: profile.lifestyle.includes('smoking'),
    showAlcoholContent: profile.lifestyle.includes('alcohol'),
    showExerciseContent: profile.lifestyle.includes('low_activity') || true, // Always show exercise
    showDiabetesContent: profile.healthConditions.includes('diabetes'),
    showSleepApneaContent: profile.healthConditions.includes('sleep_apnea'),
    showHeartDiseaseContent: profile.healthConditions.includes('heart_disease'),
    showMentalHealthContent: profile.healthConditions.includes('mental_health')
  };
};

/**
 * This function analyzes the user's profile and generates a structured list of personalized recommendations across various categories.
 * @returns {Object} Personalized recommendations
 */
export const getPersonalizedRecommendations = () => {
  const profile = getUserProfile();
  const recommendations = {
    priority: [], // High-priority recommendations
    exercise: [], // Exercise-related recommendations
    nutrition: [], // Nutrition-related recommendations
    lifestyle: [], // General lifestyle recommendations
    medical: [] // Medical recommendations
  };

  // Age-based recommendations
  if (profile.ageGroup === 'over_65') {
    recommendations.exercise.push('Tasapaino- ja voimaharjoittelu');
    recommendations.nutrition.push('Riittävä proteiinin saanti');
    recommendations.priority.push('Kaatumisen ehkäisy');
  } else if (profile.ageGroup === 'under_65') {
    recommendations.exercise.push('Kestävyys- ja lihaskuntoharjoittelu');
    recommendations.nutrition.push('Monipuolinen ruokavalio');
  }

  // Lifestyle-based recommendations
  if (profile.lifestyle.includes('smoking')) {
    recommendations.lifestyle.push('Tupakoinnin lopettaminen');
    recommendations.priority.push('Nikotiinikorvaushoito');
  }
  
  if (profile.lifestyle.includes('alcohol')) {
    recommendations.lifestyle.push('Alkoholin käytön vähentäminen');
  }
  
  if (profile.lifestyle.includes('low_activity')) {
    recommendations.priority.push('Liikunnan lisääminen asteittain');
    recommendations.exercise.push('Aloita kevyellä liikunnalla');
  }

  // Health condition-based recommendations
  if (profile.healthConditions.includes('diabetes')) {
    recommendations.medical.push('Verensokerin seuranta');
    recommendations.nutrition.push('Hiilihydraattien hallinta');
  }
  
  if (profile.healthConditions.includes('sleep_apnea')) {
    recommendations.medical.push('CPAP-laitteen käyttö');
    recommendations.lifestyle.push('Painonhallinta');
  }
  
  if (profile.healthConditions.includes('heart_disease')) {
    recommendations.medical.push('Verenpaineen seuranta');
    recommendations.nutrition.push('Vähäsuolainen ruokavalio');
  }
  
  if (profile.healthConditions.includes('mental_health')) {
    recommendations.lifestyle.push('Stressinhallinta');
    recommendations.priority.push('Mielenterveyden tuki');
  }

  return recommendations;
};

/**
 * This function identifies potential health or lifestyle risk factors based on the user's profile.
 * @returns {Array} List of risk factors
 */
export const getUserRiskFactors = () => {
  const profile = getUserProfile();
  const riskFactors = [];

  // Each identified risk factor has an associated severity level ('high', 'medium').
  if (profile.ageGroup === 'under_65') {
    riskFactors.push({ factor: 'Ikä alle 65 vuotta', level: 'medium' });
  }

  if (profile.ageGroup === 'over_65') {
    riskFactors.push({ factor: 'Ikä yli 65 vuotta', level: 'medium' });
  }

  if (profile.lifestyle.includes('smoking')) {
    riskFactors.push({ factor: 'Tupakointi', level: 'high' });
  }

  if (profile.lifestyle.includes('alcohol')) {
    riskFactors.push({ factor: 'Alkoholin käyttö', level: 'medium' });
  }

  if (profile.lifestyle.includes('low_activity')) {
    riskFactors.push({ factor: 'Vähäinen liikunta', level: 'medium' });
  }

  profile.healthConditions.forEach(condition => {
    const conditionMap = {
      'diabetes': { factor: 'Diabetes', level: 'high' },
      'sleep_apnea': { factor: 'Uniapnea', level: 'medium' },
      'heart_disease': { factor: 'Sydänsairaus', level: 'high' },
      'mental_health': { factor: 'Mielenterveyden haasteet', level: 'medium' }
    };
    
    if (conditionMap[condition]) {
      riskFactors.push(conditionMap[condition]);
    }
  });

  return riskFactors;
};

/**
 * This function resets the user's profile data in `localStorage`.
 */
export const clearUserProfile = () => {
  localStorage.removeItem('pirha_survey_answers');
  localStorage.removeItem('pirha_progress');
  localStorage.removeItem('pirha_visited_sections');
};

/**
 * This function converts internal age group identifiers (e.g., 'under_65') into user-friendly display strings (e.g., '18-64 vuotta').
 * @param {string} ageGroup - Age group identifier
 * @returns {string} Display text
*/
export const getAgeGroupDisplay = (ageGroup) => {
  const ageGroupMap = {
    'under_65': '18-64 vuotta',
    'over_65': '65+ vuotta'
  };
  return ageGroupMap[ageGroup] || 'Ei määritelty';
};

/**
 * This function converts internal lifestyle factor identifiers (e.g., 'smoking') into user-friendly display strings (e.g., 'Tupakointi').
 * @param {string} factor - Lifestyle factor identifier
 * @returns {string} Display text
*/
export const getLifestyleDisplay = (factor) => {
  const lifestyleMap = {
    'smoking': 'Tupakointi',
    'alcohol': 'Alkoholin käyttö',
    'low_activity': 'Vähäinen liikunta'
  };
  return lifestyleMap[factor] || factor;
};

/**
 * This function converts internal health condition identifiers (e.g., 'diabetes') into user-friendly display strings (e.g., 'Diabetes').
 * @param {string} condition - Health condition identifier
 * @returns {string} Display text
*/
export const getHealthConditionDisplay = (condition) => {
  const conditionMap = {
    'diabetes': 'Diabetes',
    'sleep_apnea': 'Uniapnea',
    'heart_disease': 'Sydänsairaus',
    'mental_health': 'Mielenterveyden haasteet'
  };
  return conditionMap[condition] || condition;
};