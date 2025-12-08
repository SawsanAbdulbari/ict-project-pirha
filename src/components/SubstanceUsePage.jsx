import React, { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle, Cigarette, Wine, Heart, Calendar, AlertCircle, XCircle, Brain } from "lucide-react";
import { generatePDF } from "../utils/pdfGenerator";
import { loadSurveyAnswers } from "../utils/dataStorage";
import PersonalizationIndicator from "./PersonalizationIndicator";
import AlcoholTest from "./AlcoholTest";
import SubstanceTest from "./SubstanceTest";
import SmokingTest from "./SmokingTest";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// This component renders the content page for the "Substance Use" section.
// It provides information and tests related to smoking, alcohol, and other substances.
const SubstanceUsePage = ({ onBack, onDownload }) => {
  // State for tracking the user's progress within this section.
  const [progress, setProgress] = useState({
    readSections: [],
    quizCompleted: false,
  });
  // State to hold the user's survey answers.
  const [surveyAnswers, setSurveyAnswers] = useState(null);
  // State to allow the user to toggle between all content and personalized content.
  const [showAllContent, setShowAllContent] = useState(false);
  // State to control the visibility of the different substance use tests.
  const [showAlcoholTest, setShowAlcoholTest] = useState(false);
  const [showSubstanceTest, setShowSubstanceTest] = useState(false);
  const [showSmokingTest, setShowSmokingTest] = useState(false);

  // This effect runs once on component mount to initialize the page.
  useEffect(() => {
    try {
      // Load user's survey answers from storage.
      const answers = loadSurveyAnswers();
      setSurveyAnswers(answers);
      
      // Load any previously saved progress for this section.
      const savedProgress = JSON.parse(localStorage.getItem("substanceProgress") || "{}");
      setProgress({
        readSections: [],
        quizCompleted: false,
        planDownloaded: false,
        ...savedProgress
      });

      // Mark this page as visited in the global progress tracker.
      const visited = JSON.parse(localStorage.getItem("pirha_visited_sections") || '{"sections":[]}');
      if (!visited.sections.includes("substance")) {
        visited.sections.push("substance");
        localStorage.setItem("pirha_visited_sections", JSON.stringify(visited));
      }
    } catch (error) {
      console.error('[SubstanceUsePage] Error initializing:', error);
      setSurveyAnswers({});
    }
  }, []);

  // Toggles the view between personalized content and all available content.
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
    localStorage.setItem("substanceProgress", JSON.stringify(newProgress));
  };

  // Callback function for when the alcohol test is completed.
  const handleAlcoholTestComplete = (score) => {
    const newProgress = { ...progress, quizCompleted: true };
    setProgress(newProgress);
    localStorage.setItem("substanceProgress", JSON.stringify(newProgress));
    setShowAlcoholTest(false);
  };

  // Callback function for when the other substances test is completed.
  const handleSubstanceTestComplete = (score) => {
    const newProgress = { ...progress, quizCompleted: true };
    setProgress(newProgress);
    localStorage.setItem("substanceProgress", JSON.stringify(newProgress));
    setShowSubstanceTest(false);
  };

  // Callback function for when the smoking test is completed.
  const handleSmokingTestComplete = (score) => {
    const newProgress = { ...progress, quizCompleted: true };
    setProgress(newProgress);
    localStorage.setItem("substanceProgress", JSON.stringify(newProgress));
    setShowSmokingTest(false);
  };

  // Calculates the completion percentage for this section.
  const calculateProgress = () => {
    const relevantSections = [];
    if (shouldShowSmokingContent) relevantSections.push("smoking");
    if (shouldShowAlcoholContent) relevantSections.push("alcohol");
    if (shouldShowSubstanceContent) relevantSections.push("substance");
    
    const totalTasks = relevantSections.length + 1; // Number of sections + one quiz.
    let completed = (progress.readSections || []).filter(s => relevantSections.includes(s)).length;
    if (progress.quizCompleted) completed++;
    
    return totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
  };

  // Flags to determine which content to show based on survey answers or toggle state.
  const lifestyleAnswers = surveyAnswers?.lifestyle || [];
  const shouldShowSmokingContent = showAllContent || lifestyleAnswers.includes('smoking');
  const shouldShowAlcoholContent = showAllContent || lifestyleAnswers.includes('alcohol');
  const shouldShowSubstanceContent = showAllContent || lifestyleAnswers.includes('substance');
  const hasNoSubstanceIssues = !shouldShowSmokingContent && !shouldShowAlcoholContent && !shouldShowSubstanceContent;

  // Render the AlcoholTest component when its state is active.
  if (showAlcoholTest) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowAlcoholTest(false)}
            className="flex items-center mb-6"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Takaisin
          </Button>
          <AlcoholTest onComplete={handleAlcoholTestComplete} />
        </div>
      </div>
    );
  }

  // Render the SubstanceTest component when its state is active.
  if (showSubstanceTest) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowSubstanceTest(false)}
            className="flex items-center mb-6"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Takaisin
          </Button>
          <SubstanceTest onComplete={handleSubstanceTestComplete} />
        </div>
      </div>
    );
  }

  // Render the SmokingTest component when its state is active.
  if (showSmokingTest) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowSmokingTest(false)}
            className="flex items-center mb-6"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Takaisin
          </Button>
          <SmokingTest onComplete={handleSmokingTestComplete} />
        </div>
      </div>
    );
  }

  // Show a loading indicator while waiting for survey answers.
  if (!surveyAnswers) {
    return <div className="min-h-screen bg-gray-50 p-4">Ladataan...</div>;
  }

  // If user has no substance issues based on the survey, show a confirmation message.
  if (hasNoSubstanceIssues && !showAllContent) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => onBack && onBack()}
            className="flex items-center mb-6"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Takaisin
          </Button>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Heart className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Päihteiden käyttö</h1>
            </div>

            <PersonalizationIndicator onToggleView={handleToggleView} />

            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-green-900 mb-2">
                    Hienoa! Ei toimenpiteitä tarvita
                  </h2>
                  <p className="text-green-800">
                    Kyselysi perusteella sinulla ei ole päihteiden käyttöä, joka vaatisi erityistä huomiota 
                    ennen toimenpidettä. Tämä on erinomainen lähtökohta toipumiselle!
                  </p>
                  <p className="text-green-800 mt-3">
                    Jatka terveellisiä elämäntapojasi ja keskity muihin valmisteluihin toimenpidettä varten.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <Button
                onClick={() => onBack && onBack()}
                className="px-4 py-2"
              >
                Siirry muihin sisältöihin
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAllContent(true)}
                className="px-4 py-2"
              >
                Näytä kaikki päihdeohjeet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // The main view for the substance use page, showing all relevant content.
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation button to go back. */}
        <Button
          variant="ghost"
          onClick={() => onBack && onBack()}
          className="flex items-center mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Takaisin
        </Button>

        {/* Header card with title and progress bar. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <Wine className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Päihteiden käyttö</h1>
                <p className="text-gray-600">Tupakoinnin, alkoholin ja muiden päihteiden käytön vaikutukset toipumiseen</p>
              </div>
            </div>
          </div>

          {/* Allows toggling between personalized and all content views. */}
          {surveyAnswers.lifestyle && (
            <PersonalizationIndicator onToggleView={handleToggleView} />
          )}

          {/* A message showing which sections are displayed based on survey answers. */}
          {surveyAnswers.lifestyle && !showAllContent && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Näet ohjeet koskien:</strong>{" "}
                {lifestyleAnswers.map(answer => {
                    if(answer === 'smoking') return 'Tupakointia';
                    if(answer === 'alcohol') return 'Alkoholin käyttöä';
                    if(answer === 'substance') return 'Muiden päihteiden käyttöä';
                }).join(', ')}
              </p>
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

        {/* A card explaining why quitting substance use is important before a procedure. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Miksi lopettaa ennen toimenpidettä?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            
            {shouldShowAlcoholContent && (
              <>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Parempi anestesian sieto</h3>
                  <p className="text-sm text-gray-700">
                    Alkoholin välttäminen parantaa elimistön kykyä sietää anestesiaa.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Nopeampi toipuminen</h3>
                  <p className="text-sm text-gray-700">
                    Elimistö toipuu nopeammin ilman alkoholin rasitusta.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content block for smoking cessation, shown if relevant. */}
        {shouldShowSmokingContent && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Cigarette className="w-6 h-6 text-red-600 mr-2" />
                Tupakoinnin lopettaminen
              </h2>
              <button
                onClick={() => toggleSection("smoking")}
                aria-pressed={(progress.readSections || []).includes("smoking")}
                className={`p-2 rounded-full transition-colors ${
                  (progress.readSections || []).includes("smoking")
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="sr-only">
                  {(progress.readSections || []).includes("smoking")
                    ? "Merkitse osio lukemattomaksi"
                    : "Merkitse osio luetuksi"}
                </span>
              </button>
            </div>
            <p className="text-gray-700 mb-4">
              Tupakointi heikentää merkittävästi hoitotuloksia. Lopettamalla tupakoinnin mahdollisimman varhain ennen hoitoasi parannat toipumisennustettasi. Lyhyestäkin savuttomuudesta on hyötyä.
            </p>
            <p className="text-gray-700 mb-4">
              Lopettaminen on haastavaa nikotiiniriippuvuuden sekä ajan kuluessa kehittyneen psyykkisen, emotionaalisen ja sosiaalisen riippuvuuden takia. Onnistumiseen on kuitenkin saatavilla paljon tukea.
            </p>

            <div className="space-y-4">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="benefits">
                  <AccordionTrigger className="text-base">Lopettamisen hyödyt</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Haavan paraneminen nopeutuu ja tulehdukset vähenevät</li>
                      <li>Hengitys helpottuu ja keuhkokuumeen vaara vähenee</li>
                      <li>Sydän- ja aivoinfarktin sekä keuhkoveritulpan vaara vähenee</li>
                      <li>Raajojen verisuonitukosten vaara vähenee</li>
                      <li>Suolistoleikkauksissa leikkaussauman vuotamisvaara vähenee</li>
                      <li>Luutuminen ja murtumien paraneminen nopeutuvat</li>
                      <li>Syövän hoidossa sädehoito tehoaa paremmin</li>
                      <li>Hoitoaika sairaalassa lyhenee</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="risks">
                  <AccordionTrigger className="text-base">Tupakoivan riskit leikkauksessa</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Haavan tulehtuminen ja aukeaminen</li>
                      <li>Veritulppa</li>
                      <li>Avomaha (suolistoleikkauksen yhteydessä)</li>
                      <li>Tehohoitoon joutuminen</li>
                      <li>Leikkauksen jälkeisten syöpälääkehoitojen viivästyminen</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                <h3 className="font-semibold mb-2">Tupakkariippuvuustesti</h3>
                <p className="text-sm text-gray-700 mb-3">
                    Testi mittaa tupakoinnin aiheuttaman nikotiiniriippuvuuden astetta. Vastaa kaikkiin kysymyksiin.
                </p>
                <Button
                    variant="link"
                    onClick={() => { setShowSmokingTest(true); window.scrollTo(0, 0); }}
                    className="p-0 text-blue-600 hover:text-blue-800 text-sm"
                >
                    Tee Tupakkariippuvuustesti →
                </Button>
              </div>

              <h3 className="text-lg font-semibold mt-6">Miten onnistun lopettamisessa?</h3>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="prepare">
                  <AccordionTrigger>Valmistaudu huolella</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Kerro lähipiirillesi, että olet lopettamassa.</li>
                      <li>Mieti etukäteen, miten toimit tilanteissa, joissa olet aiemmin tupakoinut.</li>
                      <li>Tiedosta vieroitusoireet (ärtyisyys, univaikeudet, päänsärky), jotka helpottavat yleensä kuukauden kuluessa.</li>
                      <li>Huomioi, että ruokahalu voi kasvaa. Painonnousun haitta on kuitenkin pienempi kuin tupakoinnin.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="support">
                  <AccordionTrigger>Hae apua ja tukea</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Kotikunnan terveyskeskus, omalääkäri tai työterveyshuolto</li>
                      <li>Apteekki</li>
                      <li>Internet: <a href="https://www.stumppi.fi" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.stumppi.fi<span className="sr-only"> (avautuu uudessa välilehdessä)</span></a>, <a href="https://www.savutonsuomi.fi" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.savutonsuomi.fi<span className="sr-only"> (avautuu uudessa välilehdessä)</span></a></li>
                      <li>Maksuton palvelupuhelin: <strong>0800 148 484</strong> (ma-ti 10-18, to 13-16)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="medication">
                  <AccordionTrigger>Lievitä vieroitusoireita lääkehoidolla</AccordionTrigger>
                  <AccordionContent>
                    <p><strong>Nikotiinikorvaushoito:</strong> Estää vieroitusoireita ja voit lopettaa tupakoinnin heti. Saat neuvoja oikeaan annosteluun apteekista tai terveydenhuollosta.</p>
                    <p className="mt-2"><strong>Reseptilääkkeet:</strong> Lääkäri voi määrätä noin 3 kuukauden lääkehoidon, joka vähentää tupakanhimoa ja vieroitusoireita. Teho alkaa yleensä viikon kuluessa.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        )}

        {/* Content block for alcohol reduction, shown if relevant. */}
        {shouldShowAlcoholContent && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Wine className="w-6 h-6 text-purple-600 mr-2" />
                Alkoholin käyttö
              </h2>
              <button
                onClick={() => toggleSection("alcohol")}
                aria-pressed={(progress.readSections || []).includes("alcohol")}
                className={`p-2 rounded-full transition-colors ${
                  (progress.readSections || []).includes("alcohol")
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="sr-only">
                  {(progress.readSections || []).includes("alcohol")
                    ? "Merkitse osio lukemattomaksi"
                    : "Merkitse osio luetuksi"}
                </span>
              </button>
            </div>
            <p className="text-gray-700 mb-4">
              Alkoholinkäyttö kuormittaa maksaa ja aivoja. Maksan toiminnan heikentyessä veren hyytymisjärjestelmä voi muuttua ja verenvuotoriski kasvaa. Toimenpidettä odottaessa on turvallisinta pidättäytyä alkoholin käytöstä kokonaan.
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold mb-2 text-purple-900">Suositus</h3>
                <p className="text-sm text-gray-700">
                  Vältä alkoholia vähintään 24-48 tuntia ennen toimenpidettä. 
                  Säännöllinen käyttö tulisi lopettaa 1-2 viikkoa aikaisemmin.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Alkoholin vaikutukset:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <XCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Heikentää immuunijärjestelmää</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Lisää verenvuodon riskiä</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Vaikuttaa anestesia-aineiden toimintaan</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Hidastaa haavan paranemista</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold mb-2">AUDIT-testi</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Arvioi alkoholinkäyttösi AUDIT-testillä. Yli 8 pistettä kertoo kohonneesta riskitasosta.
                </p>
                <Button
                  variant="link"
                  onClick={() => { setShowAlcoholTest(true); window.scrollTo(0, 0); }}
                  className="p-0 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Tee AUDIT-testi →
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content block for other substance use, shown if relevant. */}
        {shouldShowSubstanceContent && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center">
                        <Brain className="w-6 h-6 text-blue-600 mr-2" />
                        Muiden päihteiden käyttö
                    </h2>
                    <button
                        onClick={() => toggleSection("substance")}
                        aria-pressed={(progress.readSections || []).includes("substance")}
                        className={`p-2 rounded-full transition-colors ${
                        (progress.readSections || []).includes("substance")
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span className="sr-only">
                          {(progress.readSections || []).includes("substance")
                            ? "Merkitse osio lukemattomaksi"
                            : "Merkitse osio luetuksi"}
                        </span>
                    </button>
                </div>
                <p className="text-gray-700 mb-4">
                  Huumausaineiden käyttö vaikuttaa elimistön puolustusjärjestelmään, hormonitasapainoon ja erityisesti kipujärjestelmään. Tämän vuoksi hoitohenkilökunnan on erittäin tärkeää tietää, jos käytät tai olet aiemmin käyttänyt huumausaineita, jotta osaamme hoitaa sinua parhaalla mahdollisella tavalla.
                </p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                    <h3 className="font-semibold mb-2">Huumausaineet-testi</h3>
                    <p className="text-sm text-gray-700 mb-3">
                        Vastaa kaikkiin kysymyksiin rehellisesti. Testi auttaa arvioimaan päihteiden käyttöä.
                    </p>
                    <Button
                        variant="link"
                        onClick={() => { setShowSubstanceTest(true); window.scrollTo(0, 0); }}
                        className="p-0 text-blue-600 hover:text-blue-800 text-sm"
                    >
                        Tee Huumausaineet-testi →
                    </Button>
                </div>
            </div>
        )}

        {/* A general warning applicable to all substance users. */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-amber-900 flex items-center">
            <AlertCircle className="w-6 h-6 mr-2" />
            Tärkeää!
          </h2>
          <p className="text-amber-800 mb-3">
            Jos käytät päihteitä säännöllisesti tai runsaasti, älä lopeta äkillisesti. 
            Keskustele lääkärin kanssa turvallisesta lopettamisesta.
          </p>
          <p className="text-amber-800">
            Rehellisyys päihteiden käytöstä on tärkeää turvallisuutesi vuoksi. 
            Hoitohenkilökunta ei tuomitse vaan auttaa.
          </p>
        </div>

        {/* A card listing resources for getting help with substance use. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tukea ja apua</h2>
          
          {shouldShowSmokingContent && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Tupakoinnin lopettaminen:</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Stumppi.fi</strong> - Online-tuki</li>
                <li>• <strong>Terveyskeskus</strong> - Nikotiinikorvaushoito</li>
                <li>• <strong>Apteekit</strong> - Neuvonta ja tuotteet</li>
              </ul>
            </div>
          )}
          
          {shouldShowAlcoholContent && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Alkoholiongelmat:</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>A-klinikka</strong> - Päihdepalvelut</li>
                <li>• <strong>AA-ryhmät</strong> - Vertaistuki</li>
                <li>• <a href="https://paihdelinkki.fi" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"><strong>Päihdelinkki.fi</strong><span className="sr-only"> (avautuu uudessa välilehdessä)</span></a> - Online-palvelut</li>
              </ul>
            </div>
          )}

          {shouldShowSubstanceContent && (
            <div>
              <h3 className="font-semibold mb-2">Huumausaineongelmat:</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Irti Huumeista ry</strong> - Vertaistuki ja neuvonta</li>
                <li>• <strong>A-klinikka</strong> - Päihdepalvelut</li>
                <li>• <strong>Tukikohta ry</strong> - Kuntoutuspalvelut</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SubstanceUsePage;