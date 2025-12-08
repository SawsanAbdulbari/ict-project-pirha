// This component provides guidance for users with specific health conditions like Diabetes, Sleep Apnea, Heart Disease, and Mental Health issues.
import React, { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle, Activity, Heart, Moon, Brain, AlertCircle, Shield, Laugh } from "lucide-react";
import { generatePDF } from "../utils/pdfGenerator";
import { getUserProfile, getContentFlags, getHealthConditionDisplay } from "../utils/userProfile";
import PersonalizationIndicator from "./PersonalizationIndicator";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// This component renders the content page for the "Other Diseases" section.
const OtherDiseasesPage = ({ onBack, onDownload }) => {
  // This state tracks which informational sections the user has read and if they've completed the final checklist.
  const [progress, setProgress] = useState({
    readSections: [],
    checklistCompleted: false,
  });
  // These states are consistent with the other content pages, for managing user data and toggling personalized views.
  const [userProfile, setUserProfile] = useState(null);
  const [contentFlags, setContentFlags] = useState(null);
  const [showAllContent, setShowAllContent] = useState(false);

  useEffect(() => {
    // Load user profile and content flags
    const profile = getUserProfile();
    const flags = getContentFlags();
    setUserProfile(profile);
    setContentFlags(flags);
    setShowAllContent(flags.showAllContent);

    // Load progress specific to this "diseases" section is loaded from local storage.
    const savedProgress = JSON.parse(localStorage.getItem("diseasesProgress") || "{}");
    setProgress({
      readSections: [],
      checklistCompleted: false,
      planDownloaded: false,
      ...savedProgress
    });

    // Mark this page as "visited" for overall application progress tracking.
    const visited = JSON.parse(localStorage.getItem("pirha_visited_sections") || '{"sections":[]}');
    if (!visited.sections.includes("diseases")) {
      visited.sections.push("diseases");
      localStorage.setItem("pirha_visited_sections", JSON.stringify(visited));
    }
  }, []);
  // This function's role is in switching between personalized and general content.
  const handleToggleView = (showAll) => {
    setShowAllContent(showAll);
  };
  // This function marks a specific disease section (e.g., "diabetes") as read.
  const toggleSection = (section) => {
    const newProgress = { ...progress };
    const readSections = newProgress.readSections || [];

    if (readSections.includes(section)) {
      newProgress.readSections = readSections.filter((s) => s !== section);
    } else {
      newProgress.readSections = [...readSections, section];
    }
    setProgress(newProgress);
    localStorage.setItem("diseasesProgress", JSON.stringify(newProgress));
  };
  // This function dynamically calculates the total number of tasks based on the relevant conditions for the user and then computes the completion percentage.
  const calculateProgress = () => {
    const relevantSections = [];
    if (shouldShowDiabetes) relevantSections.push("diabetes");
    if (shouldShowSleepApnea) relevantSections.push("sleep_apnea");
    if (shouldShowHeartDisease) relevantSections.push("heart_disease");
    if (shouldShowMentalHealth) relevantSections.push("mental_health");

    const totalTasks = relevantSections.length + 1; // sections + checklist
    let completed = (progress.readSections || []).filter(s => relevantSections.includes(s)).length;
    if (progress.checklistCompleted) completed++;

    return totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
  };

  // These boolean flags are central to the component's logic. They determine if a section for a specific disease should be rendered.
  const shouldShowDiabetes = showAllContent || contentFlags?.showDiabetesContent;
  const shouldShowSleepApnea = showAllContent || contentFlags?.showSleepApneaContent;
  const shouldShowHeartDisease = showAllContent || contentFlags?.showHeartDiseaseContent;
  const shouldShowMentalHealth = showAllContent || contentFlags?.showMentalHealthContent;
  
  const hasNoConditions = !contentFlags?.showDiabetesContent && 
                          !contentFlags?.showSleepApneaContent && 
                          !contentFlags?.showHeartDiseaseContent && 
                          !contentFlags?.showMentalHealthContent && 
                          !showAllContent;

  if (!contentFlags) {
    return <div className="min-h-screen bg-gray-50 p-4">Ladataan...</div>;
  }

  // If the user has none of the targeted health conditions and is in personalized view, a special "all clear" message is shown.
  if (hasNoConditions && userProfile?.hasCompletedSurvey) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center mb-6"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Takaisin
          </Button>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Heart className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Muut sairaudet</h1>
            </div>

            <PersonalizationIndicator onToggleView={handleToggleView} />

            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-green-900 mb-2">
                    Ei erityisiä terveydentiloja
                  </h2>
                  <p className="text-green-800">
                    Kyselysi perusteella sinulla ei ole diabetesta, uniapneaa, sydänsairautta tai mielenterveyden 
                    haasteita, jotka vaatisivat erityistä huomiota ennen toimenpidettä.
                  </p>
                  <p className="text-green-800 mt-3">
                    Tämä yksinkertaistaa valmistautumistasi. Keskity yleisiin valmisteluohjeisiin ja muihin 
                    oleellisiin sisältöihin.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <Button
                onClick={onBack}
              >
                Siirry muihin sisältöihin
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAllContent(true)}
              >
                Näytä kaikki sairausohjeet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This counts how many conditions the user has.
  const userConditionCount = [
    contentFlags?.showDiabetesContent,
    contentFlags?.showSleepApneaContent,
    contentFlags?.showHeartDiseaseContent,
    contentFlags?.showMentalHealthContent
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Takaisin
        </Button>

        {/* Header with progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Muut sairaudet</h1>
                <p className="text-gray-600">Sairauksien hallinta ennen toimenpidettä</p>
              </div>
            </div>
          </div>

          {/* Personalization Indicator */}
          {userProfile?.hasCompletedSurvey && (
            <PersonalizationIndicator onToggleView={handleToggleView} />
          )}

          {/* Personalized message that lists the user's detected conditions. */}
          {userProfile?.hasCompletedSurvey && !showAllContent && userConditionCount > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Sinun terveydentilasi ({userConditionCount}):</strong>{" "}
                {userProfile.healthConditions.map(condition => 
                  getHealthConditionDisplay(condition)
                ).join(", ")}
              </p>
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Edistymisesi</span>
              <span>{calculateProgress()}% valmis</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* "Important for you" banner that appears if the user has any relevant conditions. */}
        {userConditionCount > 0 && !showAllContent && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3 text-amber-900 flex items-center">
              <AlertCircle className="w-6 h-6 mr-2" />
              Tärkeää sinulle
            </h2>
            <p className="text-amber-800">
              Sinulla on {userConditionCount} {userConditionCount === 1 ? 'tila' : 'tilaa'}, 
              jotka vaativat erityistä huomiota ennen toimenpidettä. 
              Käy läpi alla olevat ohjeet huolellisesti ja keskustele hoitohenkilökunnan kanssa 
              kaikista lääkityksistäsi ja hoitotoimenpiteistäsi.
            </p>
          </div>
        )}

        {/* Diabetes section: This block's purpose is to give information about diabetes. */}
        {shouldShowDiabetes && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Activity className="w-6 h-6 text-blue-600 mr-2" />
                Diabetes
              </h2>
              <button
                onClick={() => toggleSection("diabetes")}
                aria-pressed={(progress.readSections || []).includes("diabetes")}
                className={`p-2 rounded-full transition-colors ${
                  (progress.readSections || []).includes("diabetes")
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="sr-only">
                  {(progress.readSections || []).includes("diabetes")
                    ? "Merkitse osio lukemattomaksi"
                    : "Merkitse osio luetuksi"}
                </span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Tavoitteet ja seuranta</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Huono verensokeritasapaino altistaa tulehduksille ja komplikaatioille.</li>
                  <li>• Verensokerin tavoitetaso on <strong>3,9-10 mmol/l</strong>.</li>
                  <li>• Sokeritasapainoa kuvaava HbA1c-arvo tulisi mitata 1-2 kk ennen hoitoa, tavoite on <strong>&lt; 64 mmol/mol</strong>.</li>
                  <li>• Ota yhteyttä omalääkäriin tai diabeteshoitajaan lääkityksen tehostamiseksi.</li>
                  <li>• Noudata paasto-ohjeita erityisen huolellisesti.</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Lääkitys</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Metformiini saatetaan tauottaa 1-2 päivää ennen toimenpidettä. 
                  Insuliinin annosta voidaan muuttaa.
                </p>
                <p className="text-sm font-semibold text-blue-800">
                  ⚠️ Älä muuta lääkitystä itse - seuraa lääkärin ohjeita!
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold mb-2">Muista ottaa mukaan:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Verensokerimittari ja liuskat</li>
                  <li>• Omat diabeteslääkkeet/insuliini</li>
                  <li>• Välipala matalan verensokerin varalta</li>
                  <li>• Lista nykyisestä lääkityksestä</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Sleep apnea section: This block's purpose is to give information about sleep apnea. */}
        {shouldShowSleepApnea && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Moon className="w-6 h-6 text-indigo-600 mr-2" />
                Uniapnea
              </h2>
              <button
                onClick={() => toggleSection("sleep_apnea")}
                aria-pressed={(progress.readSections || []).includes("sleep_apnea")}
                className={`p-2 rounded-full transition-colors ${
                  (progress.readSections || []).includes("sleep_apnea")
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="sr-only">
                  {(progress.readSections || []).includes("sleep_apnea")
                    ? "Merkitse osio lukemattomaksi"
                    : "Merkitse osio luetuksi"}
                </span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="font-semibold mb-2">Toimenpiteeseen valmistautuminen</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Jos epäilet sairastavasi uniapneaa, hakeudu lääkärin vastaanotolle.</li>
                  <li>• On tärkeää, että uniapnea on hyvässä hoitotasapainossa ennen toimenpidettä.</li>
                  <li>• Ota oma <strong>CPAP-laite tai uniapneakisko</strong> mukaan sairaalaan.</li>
                  <li>• Varmista, että laitteesi on puhdas ja toimiva.</li>
                  <li>• Kerro uniapneastasi ja sen hoidosta anestesialääkärille.</li>
                </ul>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Lisätietoa verkossa</h3>
                <a 
                  href="https://www.terveyskyla.fi/keuhkotalo/tietoa-keuhkosairauksista/uniapnea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Terveyskylä: Uniapnea
                  <span className="sr-only"> (avautuu uudessa välilehdessä)</span>
                </a>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold mb-2 text-red-900">Tärkeää!</h3>
                <p className="text-sm text-red-800">
                  Hoitamaton uniapnea lisää anestesiaan ja toipumiseen liittyviä riskejä. 
                  Sinua saatetaan valvoa tehostetusti toimenpiteen jälkeen.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Heart disease section: This block's purpose is to give information about heart disease. */}
        {shouldShowHeartDisease && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Heart className="w-6 h-6 text-red-600 mr-2" />
                Sydänsairaus
              </h2>
              <button
                onClick={() => toggleSection("heart_disease")}
                aria-pressed={(progress.readSections || []).includes("heart_disease")}
                className={`p-2 rounded-full transition-colors ${
                  (progress.readSections || []).includes("heart_disease")
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="sr-only">
                  {(progress.readSections || []).includes("heart_disease")
                    ? "Merkitse osio lukemattomaksi"
                    : "Merkitse osio luetuksi"}
                </span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold mb-2">Ennen toimenpidettä</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Jatka sydänlääkitystä normaalisti (ellei toisin ohjeisteta)</li>
                  <li>• Verenpaineen säännöllinen seuranta</li>
                  <li>• Vältä rasittavaa liikuntaa 1-2 päivää ennen</li>
                  <li>• Ilmoita kaikista oireista hoitohenkilökunnalle</li>
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Lääkitys</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Beetasalpaajat: yleensä jatketaan</li>
                  <li>• ACE-estäjät: voidaan tauottaa</li>
                  <li>• Verenohennus: yksilöllinen arvio</li>
                  <li>• Aspiriini: seuraa lääkärin ohjeita</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold mb-2">Milloin ottaa yhteyttä?</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Rintakipu tai hengenahdistus</li>
                  <li>• Rytmihäiriöt</li>
                  <li>• Huimaus tai pyörtyminen</li>
                  <li>• Jalkojen turvotus</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Mental health section: This block's purpose is to give information about mental health issues. */}
        {shouldShowMentalHealth && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Brain className="w-6 h-6 text-purple-600 mr-2" />
                Mielenterveyden haasteet
              </h2>
              <button
                onClick={() => toggleSection("mental_health")}
                aria-pressed={(progress.readSections || []).includes("mental_health")}
                className={`p-2 rounded-full transition-colors ${
                  (progress.readSections || []).includes("mental_health")
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="sr-only">
                  {(progress.readSections || []).includes("mental_health")
                    ? "Merkitse osio lukemattomaksi"
                    : "Merkitse osio luetuksi"}
                </span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold mb-2">Valmistautuminen</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Jatka psyykelääkitystä normaalisti</li>
                  <li>• Kerro lääkityksestäsi anestesialääkärille</li>
                  <li>• Huolehdi riittävästä unesta</li>
                  <li>• Käytä stressinhallintakeinoja</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Tukiverkosto</h3>
                <p className="text-sm text-gray-700">
                  Varmista, että sinulla on tukihenkilö toimenpiteen aikana ja sen jälkeen. 
                  Kerro läheisillesi tunteistasi ja tarpeistasi.
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold mb-2">Rentoutusharjoituksia</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Syvähengitysharjoitukset</li>
                  <li>• Lihasrentoutus</li>
                  <li>• Mindfulness-meditaatio</li>
                  <li>• Mielikuvaharjoitukset</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Oral Health: This section is shown to everyone. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Laugh className="w-6 h-6 text-cyan-600 mr-2" />
              Suun terveys
            </h2>
          </div>
          <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
            <h3 className="font-semibold text-cyan-900 mb-2 flex items-center"><AlertCircle className="w-5 h-5 mr-2" />Hoida suu kuntoon hyvissä ajoin</h3>
            <p className="text-sm text-cyan-800">
              Hoitamattomat hampaat ja iensairaudet ovat merkittävä tulehdusriski leikkauksen jälkeen ja syöpähoitojen aikana. Hammashoidot voivat kestää useita viikkoja, joten hammaslääkärillä ja suuhygienistillä on syytä käydä hyvissä ajoin ennen toimenpidettä.
            </p>
          </div>
        </div>

        {/* Skin Health: This section is shown to everyone. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Shield className="w-6 h-6 text-lime-600 mr-2" />
              Ihon hoito
            </h2>
          </div>
          <div className="p-4 bg-lime-50 border border-lime-200 rounded-lg">
            <h3 className="font-semibold text-lime-900 mb-2">Tarkista ihon kunto</h3>
            <p className="text-sm text-lime-800">
              Leikkausalueen iholla ei saa olla ihottumaa. Muista tarkistaa myös varpaanvälit. Huolehdi toimenpidealueen ihon hyvästä kunnosta.
            </p>
          </div>
        </div>


        {/* Pre-procedure checklist: This checklist's content is also dynamically generated based on the user's conditions. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Muistilista ennen toimenpidettä</h2>
          
          <div className="space-y-3">
            {shouldShowDiabetes && (
              <>
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Checkbox className="mr-3" />
                  <span>Verensokeri mitattu ja kirjattu</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Checkbox className="mr-3" />
                  <span>Diabeteslääkkeet ja mittari pakattu</span>
                </label>
              </>
            )}
            
            {shouldShowSleepApnea && (
              <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Checkbox className="mr-3" />
                <span>CPAP-laite puhdistettu ja pakattu</span>
              </label>
            )}
            
            {shouldShowHeartDisease && (
              <>
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Checkbox className="mr-3" />
                  <span>Verenpaine mitattu</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Checkbox className="mr-3" />
                  <span>Sydänlääkkeet otettu ohjeen mukaan</span>
                </label>
              </>
            )}
            
            {shouldShowMentalHealth && (
              <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Checkbox className="mr-3" />
                <span>Psyykelääkitys otettu normaalisti</span>
              </label>
            )}
            
            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Checkbox className="mr-3" />
              <span>Lääkelista päivitetty ja mukana</span>
            </label>
            
            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Checkbox className="mr-3" />
              <span>Hoitohenkilökuntaa informoitu sairauksista</span>
            </label>
          </div>
          
          <Button
            onClick={() => {
              setProgress({ ...progress, checklistCompleted: true });
              localStorage.setItem("diseasesProgress", JSON.stringify({ ...progress, checklistCompleted: true }));
            }}
            className="mt-4 w-full"
            disabled={progress.checklistCompleted}
          >
            {progress.checklistCompleted ? "Tarkistettu!" : "Merkitse kaikki tarkistetuksi"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OtherDiseasesPage;