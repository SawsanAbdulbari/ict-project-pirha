// This page displays all the user-related information, including survey answers and test results.
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { loadSurveyAnswers } from '../utils/dataStorage';
import { User, ArrowLeft, Heart, Cigarette, Brain, Activity, Stethoscope, Wine, Edit } from 'lucide-react';
import { getAlcoholTestResultText as getAlcoholResultText, getSmokingTestResultText as getSmokingResultText, getSubstanceTestResultText as getSubstanceResultText } from '../utils/pdfGenerator';
// This constant object is used to map the raw keys from the survey data to human-readable labels and associate them with icons.
const surveyKeyMapping = {
    age: { label: 'Ikäryhmä', icon: Activity },
    lifestyle: { label: 'Elämäntavat', icon: Heart },
    health_conditions: { label: 'Terveydentila', icon: Stethoscope },
    smoking: { label: 'Tupakointi', icon: Cigarette },
    alcohol: { label: 'Alkoholinkäyttö', icon: Wine },
    substance: { label: 'Muiden päihteiden käyttö', icon: Brain },
    low_activity: { label: 'Vähäinen aktiivisuus', icon: Activity },
    diabetes: { label: 'Diabetes', icon: Stethoscope },
    sleep_apnea: { label: 'Uniapnea', icon: Brain },
    heart_disease: { label: 'Sydänsairaus', icon: Heart },
    mental_health: { label: 'Mielenterveys', icon: Brain },
    under_65: { label: 'Alle 65 vuotta' },
    over_65: { label: '65 vuotta tai yli' }
};
// The ProfilePage component receives the username, a function to go to the previous page, and a function for routing as props.
const ProfilePage = ({ user, onBack, navigateTo }) => {
    // This state holds the formatted answers from the main survey.
    const [surveyAnswers, setSurveyAnswers] = useState(null);
    // These arrays store the history of the user's test results loaded from local storage.
    const [alcoholTestResults, setAlcoholTestResults] = useState([]);
    const [smokingTestResults, setSmokingTestResults] = useState([]);
    const [substanceTestResults, setSubstanceTestResults] = useState([]);
    // These state variables are used to control the expandable/collapsible sections for each test result, allowing the user to view detailed answers.
    const [expandedAlcoholTest, setExpandedAlcoholTest] = useState(null);
    const [expandedSmokingTest, setExpandedSmokingTest] = useState(null);
    const [expandedSubstanceTest, setExpandedSubstanceTest] = useState(null);

    useEffect(() => {
        // This hook runs on mount to load all the necessary data from local storage using utility functions.
        const answers = loadSurveyAnswers();
        setSurveyAnswers(answers);
        
        const alcoholResults = JSON.parse(localStorage.getItem('alcoholTestResult')) || [];
        setAlcoholTestResults(alcoholResults);

        const smokingResults = JSON.parse(localStorage.getItem('smokingTestResult')) || [];
        setSmokingTestResults(smokingResults);

        const substanceResults = JSON.parse(localStorage.getItem('substanceTestResult')) || [];
        setSubstanceTestResults(substanceResults);
    }, []);
    // This helper function's purpose is to format the raw survey values into readable text using the surveyKeyMapping.
    const renderValue = (key, value) => {
        if (key === 'age') {
            return surveyKeyMapping[value]?.label || value;
        }
        if (Array.isArray(value)) {
            return value.map(v => surveyKeyMapping[v]?.label || v).join(', ');
        }
        return surveyKeyMapping[value]?.label || value;
    }

    return (
        <div className="space-y-6">
            {/* The header section with the back button and title. */}
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={onBack} className="text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Takaisin
                </Button>
                <h1 className="text-3xl font-bold text-blue-900">Oma Profiili</h1>
            </div>
            {/* The user information card. */}
            <Card className="bg-white border-blue-100 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center text-blue-800">
                        <User className="w-6 h-6 mr-3 text-blue-600" />
                        Käyttäjätiedot
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">
                        <strong>Käyttäjätunnus:</strong> {user}
                    </p>
                </CardContent>
            </Card>
            {/* The survey answers card, which iterates through the surveyAnswers object and uses the mapping to display the data with icons and labels. */}
            {surveyAnswers && (
                <Card className="bg-white border-blue-100 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-blue-800">Kyselyn vastaukset</CardTitle>
                        <CardDescription>Tähän on koottu vastauksesi kuntoutumispolun kyselyyn.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(surveyAnswers).map(([key, value]) => {
                            const mapping = surveyKeyMapping[key];
                            const Icon = mapping?.icon;
                            return (
                                <div key={key} className="p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center">
                                        {Icon && <Icon className="w-5 h-5 mr-3 text-blue-500" />}
                                        <strong className="text-blue-700">{mapping?.label || key.replace('_', ' ')}:</strong>
                                    </div>
                                    <p className="ml-8 text-gray-800">{renderValue(key, value)}</p>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            )}
            {/* The test results section. */}
            <div className="space-y-6">
                {/* The card only shows up if there are results. */}
                {alcoholTestResults.length > 0 && (
                    <Card className="bg-white border-red-100 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-red-800">AUDIT-testin tulokset</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* The mapping over the results array to display each test instance. */}
                            {alcoholTestResults.map((result, index) => (
                                <button 
                                    key={index}
                                    type="button"
                                    aria-expanded={expandedAlcoholTest === index}
                                    className="mb-4 p-4 border rounded-lg cursor-pointer hover:bg-red-50 transition-colors w-full text-left"
                                    onClick={() => setExpandedAlcoholTest(expandedAlcoholTest === index ? null : index)}
                                >
                                    <p><strong>Päivämäärä:</strong> {new Date(result.date).toLocaleDateString()}</p>
                                    <p><strong>Pisteet:</strong> {result.score}</p>
                                    <p><strong>Tulos:</strong> {getAlcoholResultText(result.score).title}</p>
                                    {/* The onClick handler that toggles the expandedAlcoholTest state to show or hide the detailed answers for that specific test instance. */}
                                    {expandedAlcoholTest === index && result.answers && (
                                        <div className="mt-4">
                                            <h4 className="font-bold">Vastaukset:</h4>
                                            {Object.entries(result.answers).map(([key, value]) => (
                                                <p key={key}>Kysymys {key}: {value}</p>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            ))}
                            {/* The "Take test again" button and its navigation function. */}
                            <Button onClick={() => navigateTo('substance_use')} className="mt-4">
                                <Edit className="w-4 h-4 mr-2" />
                                Tee testi uudelleen
                            </Button>
                        </CardContent>
                    </Card>
                )}
                {/* The card only shows up if there are results. */}
                {smokingTestResults.length > 0 && (
                    <Card className="bg-white border-yellow-100 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-yellow-800">Tupakkariippuvuustestin tulokset</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {/* The mapping over the results array to display each test instance. */}
                            {smokingTestResults.map((result, index) => (
                                <button 
                                    key={index} 
                                    type="button"
                                    aria-expanded={expandedSmokingTest === index}
                                    className="mb-4 p-4 border rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors w-full text-left"
                                    onClick={() => setExpandedSmokingTest(expandedSmokingTest === index ? null : index)}
                                >
                                    <p><strong>Päivämäärä:</strong> {new Date(result.date).toLocaleDateString()}</p>
                                    <p><strong>Pisteet:</strong> {result.score}</p>
                                    <p><strong>Tulos:</strong> {getSmokingResultText(result.score).title}</p>
                                    {/* The onClick handler that toggles the expandedSmokingTest state to show or hide the detailed answers for that specific test instance. */}
                                    {expandedSmokingTest === index && result.answers && (
                                        <div className="mt-4">
                                            <h4 className="font-bold">Vastaukset:</h4>
                                            {Object.entries(result.answers).map(([key, value]) => (
                                                <p key={key}>Kysymys {key}: {value}</p>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            ))}
                            {/* The "Take test again" button and its navigation function. */}
                            <Button onClick={() => navigateTo('substance_use')} className="mt-4">
                                <Edit className="w-4 h-4 mr-2" />
                                Tee testi uudelleen
                            </Button>
                        </CardContent>
                    </Card>
                )}
                 {/* The card only shows up if there are results. */}
                {substanceTestResults.length > 0 && (
                    <Card className="bg-white border-purple-100 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-purple-800">Huumausainetestin tulokset</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* The mapping over the results array to display each test instance. */}
                            {substanceTestResults.map((result, index) => (
                                <button 
                                    key={index} 
                                    type="button"
                                    aria-expanded={expandedSubstanceTest === index}
                                    className="mb-4 p-4 border rounded-lg cursor-pointer hover:bg-purple-50 transition-colors w-full text-left"
                                    onClick={() => setExpandedSubstanceTest(expandedSubstanceTest === index ? null : index)}
                                >
                                    <p><strong>Päivämäärä:</strong> {new Date(result.date).toLocaleDateString()}</p>
                                    <p><strong>Pisteet:</strong> {result.score}</p>
                                    <p><strong>Tulos:</strong> {getSubstanceResultText(result.score).title}</p>
                                    {/* The onClick handler that toggles the expandedSubstanceTest state to show or hide the detailed answers for that specific test instance. */}
                                    {expandedSubstanceTest === index && result.answers && (
                                        <div className="mt-4">
                                            <h4 className="font-bold">Vastaukset:</h4>
                                            {Object.entries(result.answers).map(([key, value]) => (
                                                <p key={key}>Kysymys {key}: {value}</p>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            ))}
                            {/* The "Take test again" button and its navigation function. */}
                            <Button onClick={() => navigateTo('substance_use')} className="mt-4">
                                <Edit className="w-4 h-4 mr-2" />
                                Tee testi uudelleen
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;