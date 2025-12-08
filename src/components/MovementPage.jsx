import React, { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle, Activity, Heart, Timer, AlertCircle, TrendingUp, ShieldCheck, Wind, Dumbbell } from "lucide-react";
import { generatePDF } from "../utils/pdfGenerator";
import { getUserProfile, getContentFlags, isInAgeGroup } from "../utils/userProfile";
import PersonalizationIndicator from "./PersonalizationIndicator";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// This component renders the content page for the "Movement" section.
// It provides personalized exercise recommendations and information based on user profile.
const MovementPage = ({ onBack, onDownload }) => {
  // State for tracking user's progress within this section.
  const [progress, setProgress] = useState({
    readSections: [],
    exercisesDone: false,
  });
  // State to hold the user's profile data from the survey.
  const [userProfile, setUserProfile] = useState(null);
  // State for flags that determine which content should be visible.
  const [contentFlags, setContentFlags] = useState(null);
  // State to allow the user to toggle between personalized and all content.
  const [showAllContent, setShowAllContent] = useState(false);

  // This effect runs once on component mount to initialize the page.
  useEffect(() => {
    // Load the user's profile and pre-calculated content flags.
    const profile = getUserProfile();
    const flags = getContentFlags();
    setUserProfile(profile);
    setContentFlags(flags);
    setShowAllContent(flags.showAllContent);

    // Load progress specific to the movement section from local storage.
    const savedProgress = JSON.parse(localStorage.getItem("movementProgress") || "{}");
    setProgress({
      readSections: [],
      exercisesDone: false,
      ...savedProgress
    });

    // Mark this 'movement' page as visited in the general progress tracking.
    const visited = JSON.parse(localStorage.getItem("pirha_visited_sections") || '{"sections":[]}');
    if (!visited.sections.includes("movement")) {
      visited.sections.push("movement");
      localStorage.setItem("pirha_visited_sections", JSON.stringify(visited));
    }
  }, []);

  // Toggles the view between personalized content and all available content.
  const handleToggleView = (showAll) => {
    setShowAllContent(showAll);
  };

  // Marks a subsection (like 'working-age' recommendations) as read or unread.
  const toggleSection = (section) => {
    const newProgress = { ...progress };
    const readSections = newProgress.readSections || [];

    if (readSections.includes(section)) {
      newProgress.readSections = readSections.filter((s) => s !== section);
    } else {
      newProgress.readSections = [...readSections, section];
    }
    setProgress(newProgress);
    localStorage.setItem("movementProgress", JSON.stringify(newProgress));
  };

  // Calculates the completion percentage for this section.
  const calculateProgress = () => {
    const totalTasks = 3; // Corresponds to the number of trackable tasks.
    let completed = (progress.readSections || []).length;
    if (progress.exercisesDone) completed++;
    return Math.round((completed / totalTasks) * 100);
  };



  // These flags determine which content sections are visible based on user profile or toggle state.
  const shouldShowYoungAdultContent = showAllContent || contentFlags?.showYoungAdultContent;
  const shouldShowSeniorContent = showAllContent || contentFlags?.showSeniorContent;
  const hasHeartCondition = userProfile?.healthConditions?.includes('heart_disease');
  const hasDiabetes = userProfile?.healthConditions?.includes('diabetes');
  const hasLowActivity = userProfile?.lifestyle?.includes('low_activity');

  // Generates a personalized recommendation text based on user's health conditions.
  const getExerciseIntensityRecommendation = () => {
    if (hasHeartCondition) {
      return "Aloita kevyellä intensiteetillä ja konsultoi lääkäriä ennen harjoittelun aloittamista.";
    }
    if (hasDiabetes) {
      return "Säännöllinen liikunta auttaa verensokerin hallinnassa. Muista mitata verensokeri ennen ja jälkeen liikunnan.";
    }
    if (hasLowActivity) {
      return "Aloita maltillisesti ja lisää liikuntaa asteittain. Kuuntele kehoasi.";
    }
    return "Noudata yleisiä liikuntasuosituksia ja lisää intensiteettiä asteittain.";
  };

  // Display a loading indicator until the necessary data is available.
  if (!contentFlags) {
    return <div className="min-h-screen bg-gray-50 p-4">Ladataan...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation button to go back to the previous page. */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Takaisin
        </Button>

        {/* Header card displaying the page title and progress bar. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Liikkuminen</h1>
                <p className="text-gray-600 mt-2">
                  Ennen toimenpidettä tai hoitojaksoa on tärkeää ylläpitää tai parantaa fyysistä toimintakykyä ja kuntoa huolehtimalla riittävästä liikkumisesta. Liikkumista ja arkiaktiivisuutta ei tarvitse eikä kannata vähentää toimenpidettä odottaessa vaan päinvastoin.
                </p>
                <p className="text-gray-600 mt-2">
                  Säännöllisellä, monipuolisella liikunnalla ennen toimenpidettä voi pienentää leikkausriskejä, nopeuttaa toipumista ja edistää haavan ja kudosten paranemista. Lyhyelläkin aikavälillä ennen toimenpidettä liikunnan lisäämisestä on hyötyä.
                </p>
              </div>
            </div>
          </div>

          {/* This component allows toggling between personalized and all content views. */}
          {userProfile?.hasCompletedSurvey && (
            <PersonalizationIndicator onToggleView={handleToggleView} />
          )}

          {/* A banner with a personalized tip shown only in personalized view. */}
          {userProfile?.hasCompletedSurvey && !showAllContent && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  <strong>Henkilökohtainen suositus:</strong> {getExerciseIntensityRecommendation()}
                </p>
              </div>
            </div>
          )}

          {/* The progress bar for this specific section. */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Edistymisesi</span>
              <span>{calculateProgress()}% valmis</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* An accordion component explaining the benefits of exercise. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <Heart className="w-6 h-6 text-red-500 mr-2" />
            Miksi liikkuminen on tärkeää?
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Klikkaa osioita lukeaksesi lisää liikunnan hyödyistä.
          </p>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full"><TrendingUp className="w-5 h-5 text-green-700" /></div>
                  Nopeuttaa toipumista ja vähentää riskejä
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-12">
                Säännöllinen liikunta ennen toimenpidettä pienentää leikkausriskejä, nopeuttaa toipumista ja edistää haavan sekä kudosten paranemista. Säännöllinen liikunta myös vahvistaa sydäntä ja keuhkoja sekä parantaa niiden toimintaa.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full"><ShieldCheck className="w-5 h-5 text-blue-700" /></div>
                  Parantaa kehon toimintoja välittömästi
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-12">
                Jo yhden liikuntakerran jälkeen verenpaine alenee, verensokeri- ja rasva-arvot laskevat, ja verenkierto sekä imunestekierto vilkastuvat, mikä vähentää turvotusta. Nivelet notkistuvat ja lihasten joustavuus paranee.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full"><Wind className="w-5 h-5 text-purple-700" /></div>
                  Tehostaa hengitystä
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-12">
                Hengitys tehostuu liikunnan aikana, ja keuhkojen kautta verenkiertoon ja edelleen kudoksiin virtaa enemmän happea, mikä on elintärkeää paranemisprosessille.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-full"><Dumbbell className="w-5 h-5 text-orange-700" /></div>
                  Vahvistaa tuki- ja liikuntaelimistöä
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-12">
                Voima- ja liikkuvuusharjoittelu vahvistavat tehokkaasti lihaksia, luita, jänteitä ja nivelsiteitä, tehden kehostasi kestävämmän toimenpidettä varten.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* This block shows exercise recommendations for working-age adults. */}
        {shouldShowYoungAdultContent && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Työikäisille (18-64 vuotta)</h2>
              <button
                onClick={() => toggleSection("working-age")}
                aria-pressed={(progress.readSections || []).includes("working-age")}
                className={`p-2 rounded-full transition-colors ${
                  (progress.readSections || []).includes("working-age")
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="sr-only">
                  {(progress.readSections || []).includes("working-age")
                    ? "Merkitse osio lukemattomaksi"
                    : "Merkitse osio luetuksi"}
                </span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Kestävyysliikunta</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• <strong>Reipasta:</strong> 2 tuntia 30 minuuttia viikossa. Reippaasti liikkuessa pystyt puhumaan hengästymisestä huolimatta.</li>
                  <li>• <strong>Rasittavaa:</strong> 1 tunti 15 minuuttia viikossa. Rasittavasti liikkuessa puhuminen on jo hankalaa.</li>
                  {hasLowActivity && (
                    <li className="text-blue-600 font-medium">
                      • Aloita 10 minuutin pätkissä ja lisää asteittain.
                    </li>
                  )}
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold mb-2">Lihaskunto ja liikehallinta</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Vähintään 2 kertaa viikossa.</li>
                  <li>• Kuormita suuria lihasryhmiä. Vastuksen tulisi olla sellainen, että jaksat tehdä enintään 10-15 toistoa.</li>
                  {hasHeartCondition && (
                    <li className="text-orange-600 font-medium">
                      • Vältä pidättämästä hengitystä nostoja tehdessä.
                    </li>
                  )}
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold mb-2">Tauot istumiseen</h3>
                <p className="text-sm text-gray-700">
                  Aina kun mahdollista, vältä pitkiä istumisjaksoja.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* This block shows exercise recommendations for seniors. */}
        {shouldShowSeniorContent && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Ikääntyneille (65+ vuotta)</h2>
              <button
                onClick={() => toggleSection("elderly")}
                aria-pressed={(progress.readSections || []).includes("elderly")}
                className={`p-2 rounded-full transition-colors ${
                  (progress.readSections || []).includes("elderly")
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="sr-only">
                  {(progress.readSections || []).includes("elderly")
                    ? "Merkitse osio lukemattomaksi"
                    : "Merkitse osio luetuksi"}
                </span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Kestävyysliikunta</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• <strong>Reipasta:</strong> 2 tuntia 30 minuuttia viikossa. Reippaasti liikkuessa pystyt puhumaan hengästymisestä huolimatta.</li>
                  <li>• <strong>Rasittavaa:</strong> 1 tunti 15 minuuttia viikossa. Rasittavasti liikkuessa puhuminen on jo hankalaa.</li>
                  {hasDiabetes && (
                    <li className="text-blue-600 font-medium">
                      • Säännöllinen liikunta samaan aikaan päivästä auttaa verensokerin hallinnassa.
                    </li>
                  )}
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold mb-2">Lihaskunto</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Vähintään 2 kertaa viikossa.</li>
                  <li>• Kuormita suuria lihasryhmiä. Vastuksen tulisi olla sellainen, että jaksat tehdä enintään 10-15 toistoa.</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold mb-2">Tasapaino ja notkeys</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Vähintään 2 kertaa viikossa</li>
                  <li>• Erityisen tärkeää kaatumisten ehkäisyssä</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* A warning box about the risks of inactivity. */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-8 h-8 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold mb-2 text-red-900">Varo liikkumattomuutta</h2>
              <p className="text-red-800">
                Leikkauksen, kipujen ja haavan takia liikkuminen saattaa vähentyä. On kuitenkin tärkeää muistaa, että <strong>lihasmassa alkaa pienentyä jo muutaman päivän vuodelevon ja liikkumattomuuden aikana</strong>. Tämä heikentää lihasvoimaa ja yleistä toimintakykyä, mikä voi hidastaa toipumistasi.
              </p>
            </div>
          </div>
        </div>

        {/* A card with important notes and personalized advice based on health conditions. */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-amber-900">Tärkeää huomioida</h2>
          <div className="space-y-3">
            {hasHeartCondition && (
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800">
                    <strong>Sydänsairaus:</strong> Konsultoi lääkäriä ennen uuden liikuntaohjelman aloittamista. 
                    Vältä äkillisiä voimakkaita ponnistuksia.
                  </p>
                </div>
              </div>
            )}
            
            {hasDiabetes && (
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800">
                    <strong>Diabetes:</strong> Mittaa verensokeri ennen ja jälkeen liikunnan. 
                    Pidä mukana hiilihydraatteja matalan verensokerin varalta.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800">
                  Asteittainen lisääminen: Liikkumismäärää suositellaan lisäämään asteittain, 
                  esimerkiksi 10% viikossa.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800">
                  Jos liikkumiskykysi on heikentynyt, aloita liikunta terveydenhuollon ammattilaisen 
                  ohjauksessa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* An interactive checklist for users to track their exercises. */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Timer className="w-6 h-6 text-blue-600 mr-2" />
            Kokeile näitä harjoituksia
          </h2>
          <div className="space-y-3">
            {hasLowActivity ? (
              // Shows simpler exercises if the user has low activity levels.
              <>
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="mr-3" />
                  <span>Kävely 10 minuuttia tasaisella alustalla</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="mr-3" />
                  <span>Tuolilta ylösnousut 5 kertaa</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="mr-3" />
                  <span>Hellävarainen venyttely 5 minuuttia</span>
                </label>
              </>
            ) : (
              // Shows standard exercises for other users.
              <>
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="mr-3" />
                  <span>Kävelylenkki 20-30 minuuttia</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="mr-3" />
                  <span>Venyttely 10 minuuttia</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="mr-3" />
                  <span>Lihaskuntoharjoitukset kotona</span>
                </label>
              </>
            )}
          </div>
          <Button
            onClick={() => {
              setProgress({ ...progress, exercisesDone: true });
              localStorage.setItem("movementProgress", JSON.stringify({ ...progress, exercisesDone: true }));
            }}
            className="mt-4"
            disabled={progress.exercisesDone}
          >
            {progress.exercisesDone ? "Harjoitukset tehty!" : "Merkitse tehdyksi"}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default MovementPage;