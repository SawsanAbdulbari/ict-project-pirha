import React, { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle, Brain, Heart, Wind, Moon, Smile, AlertCircle, MessageSquare, UserCheck, BookOpen, Users } from "lucide-react";
import { generatePDF } from "../utils/pdfGenerator";
import { getUserProfile, getContentFlags } from "../utils/userProfile";
import PersonalizationIndicator from "./PersonalizationIndicator";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// This component renders the content page for the "Mental Wellbeing" section.
// It provides information and exercises related to stress management and mental preparation.
const MentalWellbeingPage = ({ onBack, onDownload }) => {
  // State for tracking the user's progress within this specific section.
  const [progress, setProgress] = useState({
    readSections: [],
    exercisesDone: false,
  });
  // State to hold the user's profile data, loaded from storage.
  const [userProfile, setUserProfile] = useState(null);
  // State for flags that determine which content should be visible based on the profile.
  const [contentFlags, setContentFlags] = useState(null);
  // State to allow the user to toggle between personalized and all content views.
  const [showAllContent, setShowAllContent] = useState(false);

  // This effect runs once on component mount to initialize the page.
  useEffect(() => {
    // Fetches the user profile and content flags from utility functions.
    const profile = getUserProfile();
    const flags = getContentFlags();
    setUserProfile(profile);
    setContentFlags(flags);
    setShowAllContent(flags.showAllContent);

    // Loads any previously saved progress for the mental wellbeing section.
    const savedProgress = JSON.parse(localStorage.getItem("mentalProgress") || "{}");
    setProgress({
      readSections: [],
      exercisesDone: false,
      planDownloaded: false,
      ...savedProgress
    });

    // Marks this page as visited in the global site progress.
    const visited = JSON.parse(localStorage.getItem("pirha_visited_sections") || '{"sections":[]}');
    if (!visited.sections.includes("mental")) {
      visited.sections.push("mental");
      localStorage.setItem("pirha_visited_sections", JSON.stringify(visited));
    }
  }, []);

  // Allows the user to switch between seeing all content and just personalized content.
  const handleToggleView = (showAll) => {
    setShowAllContent(showAll);
  };

  // Marks a specific subsection as "read" and updates the progress state.
  const toggleSection = (section) => {
    const newProgress = { ...progress };
    const readSections = newProgress.readSections || [];

    if (readSections.includes(section)) {
      newProgress.readSections = readSections.filter((s) => s !== section);
    } else {
      newProgress.readSections = [...readSections, section];
    }
    setProgress(newProgress);
    localStorage.setItem("mentalProgress", JSON.stringify(newProgress));
  };

  // Calculates the completion percentage for this section based on tracked tasks.
  const calculateProgress = () => {
    const totalTasks = 4; // The number of progress-trackable items on this page.
    let completed = (progress.readSections || []).length;
    if (progress.exercisesDone) completed++;
    return Math.round((completed / totalTasks) * 100);
  };

  // Boolean flags to determine which content should be rendered based on user profile.
  const hasMentalHealthChallenges = userProfile?.healthConditions?.includes('mental_health');
  const hasHeartDisease = userProfile?.healthConditions?.includes('heart_disease');
  const hasSleepApnea = userProfile?.healthConditions?.includes('sleep_apnea');
  const hasSubstanceUse = userProfile?.lifestyle?.includes('smoking') || userProfile?.lifestyle?.includes('alcohol');
  const isElderly = userProfile?.ageGroup === 'over_65';

  // Generates an array of personalized recommendation objects based on the user's profile.
  const getPersonalizedRecommendations = () => {
    const recommendations = [];
    
    if (hasMentalHealthChallenges) {
      recommendations.push({
        title: "Mielenterveyden tuki",
        content: "Jatka säännöllisesti psyykelääkitystä ja kerro hoitohenkilökunnalle mielenterveyden haasteistasi.",
        priority: "high",
        color: "purple"
      });
    }
    
    if (hasHeartDisease) {
      recommendations.push({
        title: "Stressin vaikutus sydämeen",
        content: "Stressi voi pahentaa sydänoireita. Rentoutuminen on erityisen tärkeää sinulle.",
        priority: "medium",
        color: "red"
      });
    }
    
    if (hasSleepApnea) {
      recommendations.push({
        title: "Unen laatu ja mieliala",
        content: "Uniapnea voi vaikuttaa mielialaan. CPAP-laitteen säännöllinen käyttö parantaa unen laatua.",
        priority: "medium",
        color: "indigo"
      });
    }
    
    if (hasSubstanceUse) {
      recommendations.push({
        title: "Päihteiden vaikutus mielialaan",
        content: "Päihteiden vähentäminen parantaa mielialaa ja auttaa stressinhallinnassa.",
        priority: "medium",
        color: "orange"
      });
    }
    
    if (isElderly) {
      recommendations.push({
        title: "Ikääntyneiden erityistarpeet",
        content: "Sosiaalisten kontaktien ylläpito ja aktiivisuus tukevat henkistä hyvinvointia.",
        priority: "low",
        color: "blue"
      });
    }
    
    return recommendations;
  };

  // Stores the generated personalized recommendations.
  const personalizedRecommendations = getPersonalizedRecommendations();

  // Displays a loading message until the content flags are ready.
  if (!contentFlags) {
    return <div className="min-h-screen bg-gray-50 p-4">Ladataan...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation button to return to the previous page. */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Takaisin
        </Button>

        {/* Header card containing the page title, introduction, and progress bar. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Henkinen jaksaminen</h1>
                <p className="text-gray-600">Stressinhallinta ja mielenterveyden tukeminen</p>
              </div>
            </div>
          </div>

          {/* Component to toggle between personalized and all content views. */}
          {userProfile?.hasCompletedSurvey && (
            <PersonalizationIndicator onToggleView={handleToggleView} />
          )}

          {/* Displays personalized recommendations if available and not in "show all" mode. */}
          {userProfile?.hasCompletedSurvey && !showAllContent && personalizedRecommendations.length > 0 && (
            <div className="mt-4 space-y-3">
              {personalizedRecommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className={`p-3 bg-${rec.color}-50 border border-${rec.color}-200 rounded-lg ${
                    rec.priority === 'high' ? 'border-2' : ''
                  }`}
                >
                  <div className="flex items-start">
                    {rec.priority === 'high' && (
                      <AlertCircle className={`w-5 h-5 text-${rec.color}-600 mr-2 flex-shrink-0 mt-0.5`} />
                    )}
                    <div>
                      <h3 className={`font-semibold text-${rec.color}-900 mb-1`}>{rec.title}</h3>
                      <p className={`text-sm text-${rec.color}-800`}>{rec.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Progress bar for this section. */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Edistymisesi</span>
              <span>{calculateProgress()}% valmis</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* This card validates the common emotional reactions to a diagnosis. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Sairastuminen herättää tunteita</h2>
            <p className="text-gray-700 mb-3">
              Diagnoosin tai toimenpidepäätöksen saaminen on mullistava hetki, joka käynnistää monenlaisia ajatuksia ja tunteita. On täysin normaalia kokea esimerkiksi epäuskoa, ahdistusta tai jopa paniikinomaisia oireita, kuten sydämentykytystä. Nämä tuntemukset menevät yleensä ohi muutamassa päivässä mielen sopeutuessa tilanteeseen.
            </p>
            <p className="text-gray-700">
              Kysymykset "Miksi minä?" tai "Miten selviän tästä?" ovat yleisiä. Sairauteen voi liittyä myös syyllisyyden tunteita, ja tunteiden nopea vaihtelu voi yllättää. Muista, että jokainen käsittelee sairastumistaan omalla tavallaan ja omassa tahdissaan.
            </p>
        </div>

        {/* Card explaining the general importance of mental wellbeing. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Miksi henkinen jaksaminen on tärkeää?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Vähentää komplikaatioita</h3>
              <p className="text-sm text-gray-700">
                Stressi ja ahdistus voivat hidastaa paranemista ja lisätä komplikaatioriskiä.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Parantaa kipujen hallintaa</h3>
              <p className="text-sm text-gray-700">
                Rentoutuminen ja positiivinen mieliala vähentävät kivun kokemusta.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Tukee toipumista</h3>
              <p className="text-sm text-gray-700">
                Hyvä mieliala ja motivaatio nopeuttavat kuntoutumista.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Parantaa unta</h3>
              <p className="text-sm text-gray-700">
                Stressinhallinta ja rentoutuminen parantavat unen laatua.
              </p>
            </div>
          </div>
        </div>

        {/* An accordion component with various coping strategies. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <UserCheck className="w-6 h-6 text-green-600 mr-2" />
            Keinoja jaksamiseen
          </h2>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Puhu ja jaa ajatuksiasi</AccordionTrigger>
              <AccordionContent>
                <p>Sairauden salailu vie voimia. Puhu avoimesti läheistesi kanssa. Jos perheessäsi on lapsia, kerro heille sairaudesta ja toimenpiteestä ikätasoisesti. On myös tärkeää informoida asiasta lasten päiväkotia ja koulua. Jos puhuminen ei tunnu luontevalta, kokeile kirjoittaa ajatuksiasi paperille.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Hanki tietoa ja tukea</AccordionTrigger>
              <AccordionContent>
                <p>Ota läheinen mukaan lääkärikäynneille tueksi ja toiseksi korvapariksi. Jos se ei ole mahdollista, kirjoita lääkärin kertomia asioita muistiin. On myös hyvä kirjoittaa etukäteen ylös mieltä askarruttavia kysymyksiä.</p>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-semibold text-amber-900 flex items-center"><AlertCircle className="w-5 h-5 mr-2" />Varo väärää tietoa</h4>
                    <p className="text-sm text-amber-800 mt-1">
                      Kuulet varmasti erilaisia potilastarinoita. Muista, että jokainen kokee sairautensa yksilöllisesti. Hae tietoa vain luotettavilta tahoilta, äläkä luota vahvistamattomiin internet-lähteisiin. Oikeimman tiedon saat aina sinua hoitavilta ammattilaisilta.
                    </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Ole armollinen itsellesi</AccordionTrigger>
              <AccordionContent>
                <p>Sinulla on lupa välillä olla tekemättä mitään. Opettele rentoutumaan ja nauti asioista, jotka tuottavat sinulle iloa ja voimaannuttavat sinua. Myös huumori on tärkeä voimavara. Yritä ylläpitää mahdollisimman normaalia arkea, sillä tuttuus tuo turvallisuuden tunnetta.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* This card provides information on various stress management techniques. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Heart className="w-6 h-6 text-red-600 mr-2" />
              Stressinhallintakeinoja
            </h2>
            <button
              onClick={() => toggleSection("stress")}
              aria-pressed={(progress.readSections || []).includes("stress")}
              className={`p-2 rounded-full transition-colors ${
                (progress.readSections || []).includes("stress")
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="sr-only">
                {(progress.readSections || []).includes("stress")
                  ? "Merkitse osio lukemattomaksi"
                  : "Merkitse osio luetuksi"}
              </span>
            </button>
          </div>

          <div className="space-y-4">
            {hasMentalHealthChallenges ? (
              // Shows enhanced content for users with pre-existing mental health challenges.
              <>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold mb-2 text-purple-900">Erityistuki sinulle</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Jatka säännöllistä hoitokontaktia</li>
                    <li>• Käytä opittuja selviytymiskeinoja</li>
                    <li>• Pidä päiväkirjaa tunteistasi</li>
                    <li>• Hyödynnä tukiverkostoa aktiivisesti</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Kriisitilanteessa:</h3>
                  <p className="text-sm text-purple-800 mb-2">
                    Kriisipuhelin: 09-2525-0111 (24/7)
                  </p>
                  <p className="text-sm text-purple-800">
                    Ota yhteyttä hoitotahoon matalalla kynnyksellä.
                  </p>
                </div>
              </>
            ) : (
              // Shows standard stress management techniques.
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-1">Tietoinen läsnäolo</h3>
                  <p className="text-sm text-gray-700">
                    Keskity hetkeen, havainnoi ympäristöäsi ilman arvostelua.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-1">Liikunta</h3>
                  <p className="text-sm text-gray-700">
                    Säännöllinen liikunta vähentää stressihormoneja.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-1">Sosiaaliset suhteet</h3>
                  <p className="text-sm text-gray-700">
                    Keskustele läheisten kanssa tunteistasi.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* A card with instructions for breathing exercises. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Wind className="w-6 h-6 text-blue-600 mr-2" />
              Hengitysharjoitukset
            </h2>
            <button
              onClick={() => toggleSection("breathing")}
              aria-pressed={(progress.readSections || []).includes("breathing")}
              className={`p-2 rounded-full transition-colors ${
                (progress.readSections || []).includes("breathing")
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="sr-only">
                {(progress.readSections || []).includes("breathing")
                  ? "Merkitse osio lukemattomaksi"
                  : "Merkitse osio luetuksi"}
              </span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-3">4-4-6 Hengitys</h3>
              <ol className="space-y-2 text-sm">
                <li>1. Hengitä sisään nenän kautta laskien neljään</li>
                <li>2. Pidätä hengitystä laskien neljään</li>
                <li>3. Hengitä ulos suun kautta laskien kuuteen</li>
                <li>4. Toista 5-10 kertaa</li>
              </ol>
              {hasHeartDisease && (
                <p className="text-xs text-red-600 mt-2">
                  Huom: Vältä liian pitkiä hengityksen pidätyksiä sydänsairauden vuoksi.
                </p>
              )}
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold mb-3">Pallean hengitys</h3>
              <ol className="space-y-2 text-sm">
                <li>1. Aseta käsi vatsalle</li>
                <li>2. Hengitä syvään niin että vatsa nousee</li>
                <li>3. Hengitä ulos hitaasti</li>
                <li>4. Tunne kuinka vatsa laskee</li>
              </ol>
            </div>
          </div>
        </div>

        {/* A card with instructions for progressive muscle relaxation. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Smile className="w-6 h-6 text-green-600 mr-2" />
              Lihasrentoutus
            </h2>
            <button
              onClick={() => toggleSection("relaxation")}
              aria-pressed={(progress.readSections || []).includes("relaxation")}
              className={`p-2 rounded-full transition-colors ${
                (progress.readSections || []).includes("relaxation")
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="sr-only">
                {(progress.readSections || []).includes("relaxation")
                  ? "Merkitse osio lukemattomaksi"
                  : "Merkitse osio luetuksi"}
              </span>
            </button>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold mb-3">Progressiivinen lihasrentoutus</h3>
            <ol className="space-y-2 text-sm">
              <li>1. Aloita varpaista - jännitä 5 sekuntia</li>
              <li>2. Rentouta ja tunne ero</li>
              <li>3. Siirry ylöspäin kehossa</li>
              <li>4. Jännitä ja rentouta jokainen lihasryhmä</li>
              <li>5. Lopuksi rentouta koko keho</li>
            </ol>
            {isElderly && (
              <p className="text-xs text-blue-600 mt-2">
                Vinkki: Tee harjoitus istuen, jos makuuasento on epämukava.
              </p>
            )}
          </div>
        </div>

        {/* A card providing tips for good sleep hygiene. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Moon className="w-6 h-6 text-indigo-600 mr-2" />
              Unen laatu
            </h2>
            <button
              onClick={() => toggleSection("sleep")}
              aria-pressed={(progress.readSections || []).includes("sleep")}
              className={`p-2 rounded-full transition-colors ${
                (progress.readSections || []).includes("sleep")
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="sr-only">
                {(progress.readSections || []).includes("sleep")
                  ? "Merkitse osio lukemattomaksi"
                  : "Merkitse osio luetuksi"}
              </span>
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-gray-700">
              Hyvä uni on tärkeää toipumiselle {hasSleepApnea && "- erityisesti uniapnean kanssa"}.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Säännöllinen unirytmi</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Viileä, pimeä makuuhuone</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Vältä kofeiinia iltapäivällä</span>
              </li>
              {hasSleepApnea && (
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-indigo-700">Käytä CPAP-laitetta joka yö</span>
                </li>
              )}
              {hasMentalHealthChallenges && (
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-purple-700">Ota psyykelääkkeet säännöllisesti samaan aikaan</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* An interactive checklist of mental wellbeing exercises. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Kokeile näitä harjoituksia</h2>
          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Checkbox className="mr-3" />
              <span>5 minuutin hengitysharjoitus</span>
            </label>
            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Checkbox className="mr-3" />
              <span>10 minuutin lihasrentoutus</span>
            </label>
            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Checkbox className="mr-3" />
              <span>Päiväkirjan kirjoittaminen</span>
            </label>
            {hasMentalHealthChallenges && (
              <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Checkbox className="mr-3" />
                <span>Mielialan seuranta (1-10 asteikko)</span>
              </label>
            )}
          </div>
          <Button
            onClick={() => {
              setProgress({ ...progress, exercisesDone: true });
              localStorage.setItem("mentalProgress", JSON.stringify({ ...progress, exercisesDone: true }));
            }}
            className="mt-4"
            disabled={progress.exercisesDone}
          >
            {progress.exercisesDone ? "Harjoitukset tehty!" : "Merkitse tehdyksi"}
          </Button>
        </div>
        
        {/* A card with information about social worker support services. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-6 h-6 text-sky-600 mr-2" />
            Sosiaalityöntekijä auttaa tarvittaessa
          </h2>
          <p className="text-gray-700 mb-3">
            Sairaalan sosiaalityöntekijän kanssa voi keskustella sairauden aiheuttamista muutoksista elämäntilanteeseen, kuten toimeentuloon, kotona selviytymiseen, asumiseen, työhön ja opiskeluun. Sosiaalityöntekijältä saa tietoa, ohjausta ja neuvontaa sosiaaliturvaan, palveluihin ja kuntoutukseen liittyen.
          </p>
          <p className="text-gray-700">
            Yhteyden sosiaalityöntekijään saa hoitohenkilökunnan kautta tai Pirkanmaan hyvinvointialueen verkkosivuilta.
          </p>
        </div>


        {/* A card with resources for getting help and support. */}
        {(hasMentalHealthChallenges || !showAllContent) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-amber-900">Tukea ja apua</h2>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Kriisipuhelin:</strong> 09-2525-0111 (24/7)
              </div>
              <div>
                <strong>Mieli ry:</strong> Kriisikeskukset ympäri Suomen
              </div>
              {hasMentalHealthChallenges && (
                <>
                  <div>
                    <strong>Oma hoitotaho:</strong> Ota yhteyttä matalalla kynnyksellä
                  </div>
                  <div>
                    <strong>Vertaistuki:</strong> Kysy hoitotaholtasi vertaistukiryhmistä
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentalWellbeingPage;