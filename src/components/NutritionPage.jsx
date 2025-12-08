import React, { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle, Apple, Utensils, Droplets, Clock, AlertCircle, Soup, PlusCircle, Link, ExternalLink } from "lucide-react";
import { generatePDF } from "../utils/pdfGenerator";
import { getUserProfile, getContentFlags } from "../utils/userProfile";
import PersonalizationIndicator from "./PersonalizationIndicator";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const NutritionPage = ({ onBack, onDownload }) => {
  const [progress, setProgress] = useState({
    readSections: [],
    mealPlanCreated: false,
  });
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

    // Load saved progress
    const savedProgress = JSON.parse(localStorage.getItem("nutritionProgress") || "{}");
    setProgress({
      readSections: [],
      mealPlanCreated: false,
      planDownloaded: false,
      ...savedProgress
    });

    // Mark page as visited
    const visited = JSON.parse(localStorage.getItem("pirha_visited_sections") || '{"sections":[]}');
    if (!visited.sections.includes("nutrition")) {
      visited.sections.push("nutrition");
      localStorage.setItem("pirha_visited_sections", JSON.stringify(visited));
    }
  }, []);

  const handleToggleView = (showAll) => {
    setShowAllContent(showAll);
  };

  const toggleSection = (section) => {
    const newProgress = { ...progress };
    const readSections = newProgress.readSections || [];

    if (readSections.includes(section)) {
      newProgress.readSections = readSections.filter((s) => s !== section);
    } else {
      newProgress.readSections = [...readSections, section];
    }
    setProgress(newProgress);
    localStorage.setItem("nutritionProgress", JSON.stringify(newProgress));
  };

  const calculateProgress = () => {
    const totalTasks = 3; // sections + meal plan
    let completed = (progress.readSections || []).length;
    if (progress.mealPlanCreated) completed++;
    return Math.round((completed / totalTasks) * 100);
  };

  // Determine content based on user profile
  const shouldShowSeniorContent = showAllContent || contentFlags?.showSeniorContent;
  const shouldShowYoungAdultContent = showAllContent || contentFlags?.showYoungAdultContent;
  const hasDiabetes = userProfile?.healthConditions?.includes('diabetes');
  const hasHeartDisease = userProfile?.healthConditions?.includes('heart_disease');
  const hasSleepApnea = userProfile?.healthConditions?.includes('sleep_apnea');

  // Get personalized nutrition recommendations
  const getPersonalizedNutritionTips = () => {
    const tips = [];
    
    if (hasDiabetes) {
      tips.push({
        title: "Diabeteksen hallinta",
        content: "Säännöllinen ateriarytmi ja hiilihydraattien laskeminen ovat tärkeitä verensokerin hallinnassa.",
        color: "blue"
      });
    }
    
    if (hasHeartDisease) {
      tips.push({
        title: "Sydänystävällinen ruokavalio",
        content: "Vähennä suolan käyttöä ja suosi kasviöljyjä. Vältä tyydyttyneitä rasvoja.",
        color: "red"
      });
    }
    
    if (hasSleepApnea) {
      tips.push({
        title: "Painonhallinta",
        content: "Maltillinen painonpudotus voi helpottaa uniapnean oireita. Vältä raskaita aterioita illalla.",
        color: "purple"
      });
    }
    
    if (userProfile?.ageGroup === 'over_65') {
      tips.push({
        title: "Proteiinin tarve korostunut",
        content: "Yli 65-vuotiailla proteiinin tarve on 1.2-1.5 g/kg/vrk lihasmassan ylläpitämiseksi.",
        color: "green"
      });
    }
    
    return tips;
  };

  const personalizedTips = getPersonalizedNutritionTips();

  if (!contentFlags) {
    return <div className="min-h-screen bg-gray-50 p-4">Ladataan...</div>;
  }

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
              <Apple className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ravitsemus</h1>
                <p className="text-gray-600 mt-2">
                  Hyvä ravitsemustila vähentää toimenpiteeseen liittyvää komplikaatioriskiä sekä edistää toipumista ja kuntoutumista. On tärkeää, että aloitat muutosten tekemisen heti, sillä ravitsemustilan kohentamiseen ei riitä muutama päivä.
                </p>
              </div>
            </div>
          </div>

          {/* Personalization Indicator */}
          {userProfile?.hasCompletedSurvey && (
            <PersonalizationIndicator onToggleView={handleToggleView} />
          )}

          {/* Personalized nutrition tips */}
          {userProfile?.hasCompletedSurvey && !showAllContent && personalizedTips.length > 0 && (
            <div className="mt-4 space-y-3">
              {personalizedTips.map((tip, index) => (
                <div key={index} className={`p-3 bg-${tip.color}-50 border border-${tip.color}-200 rounded-lg`}>
                  <h3 className={`font-semibold text-${tip.color}-900 mb-1`}>{tip.title}</h3>
                  <p className={`text-sm text-${tip.color}-800`}>{tip.content}</p>
                </div>
              ))}
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
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Why nutrition matters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Miksi ravitsemus on tärkeää?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Nopeampi paraneminen</h3>
              <p className="text-sm text-gray-700">
                Riittävä proteiini ja energia tukevat kudosten paranemista.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Vahvempi vastustuskyky</h3>
              <p className="text-sm text-gray-700">
                Monipuolinen ravinto vahvistaa immuunijärjestelmää.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Parempi jaksaminen</h3>
              <p className="text-sm text-gray-700">
                Tasainen verensokeri ylläpitää energiatasoa.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Komplikaatioiden ehkäisy</h3>
              <p className="text-sm text-gray-700">
                Hyvä ravitsemustila vähentää infektioriskiä.
              </p>
            </div>
          </div>
        </div>

        {/* Meal Rhythm and Weight Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="w-6 h-6 text-gray-800 mr-2" />
            Ateriarytmi ja painonhallinta
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700">Syö säännöllisesti</h3>
              <p className="text-sm text-gray-600">
                Syö säännöllisesti aamupala, lounas, päivällinen ja iltapala. Ota tarvittaessa välipaloja estääksesi tahaton laihtuminen, joka voi heikentää lihaksia.
              </p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-semibold text-amber-900 flex items-center"><AlertCircle className="w-5 h-5 mr-2" />Tärkeää painonhallinnasta</h3>
              <p className="text-sm text-amber-800 mt-2">
                Jos lääkäri on suositellut sinulle laihduttamista ennen toimenpidettä, tee se hallitusti vähentämällä annoskokoja ja karsimalla epäterveellisiä ruokia. Varmista kuitenkin riittävä proteiininsaanti ja lihaskuntoharjoittelu.
              </p>
              <p className="text-sm text-red-700 font-bold mt-2">
                LOPETA laihduttaminen viimeistään kaksi viikkoa ennen toimenpidettä, jotta keholla on tarpeeksi energiaa tulevaan rasitukseen.
              </p>
            </div>
          </div>
        </div>


        {/* Plate model - Personalized */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Utensils className="w-6 h-6 text-green-600 mr-2" />
              Lautasmalli
            </h2>
            <button
              onClick={() => toggleSection("plate-model")}
              aria-pressed={(progress.readSections || []).includes("plate-model")}
              className={`p-2 rounded-full transition-colors ${
                (progress.readSections || []).includes("plate-model")
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="sr-only">
                {(progress.readSections || []).includes("plate-model")
                  ? "Merkitse osio lukemattomaksi"
                  : "Merkitse osio luetuksi"}
              </span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">½</div>
                <h3 className="font-semibold mb-1">Kasvikset</h3>
                <p className="text-sm text-gray-600">Salaatti, lämpimät kasvikset</p>
                {hasDiabetes && (
                  <p className="text-xs text-blue-600 mt-1">Vähän hiilihydraatteja sisältävät</p>
                )}
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">¼</div>
                <h3 className="font-semibold mb-1">Proteiini</h3>
                <p className="text-sm text-gray-600">Kala, kana, liha, palkokasvit</p>
                {userProfile?.ageGroup === 'over_65' && (
                  <p className="text-xs text-purple-600 mt-1">Erityisen tärkeää ikääntyneille</p>
                )}
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 mb-2">¼</div>
                <h3 className="font-semibold mb-1">Hiilihydraatit</h3>
                <p className="text-sm text-gray-600">Peruna, riisi, pasta, leipä</p>
                {hasDiabetes && (
                  <p className="text-xs text-red-600 mt-1">Valitse täysjyvä, laske annoskoko</p>
                )}
              </div>
            </div>

            {hasHeartDisease && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Sydänsairaus:</strong> Käytä vähäsuolaisia vaihtoehtoja ja suosi kasviöljyjä.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Protein needs - Age specific */}
        {shouldShowSeniorContent && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Proteiinin tarve - Ikääntyneet</h2>
                          <button
                            onClick={() => toggleSection("protein-senior")}
                            aria-pressed={(progress.readSections || []).includes("protein-senior")}
                            className={`p-2 rounded-full transition-colors ${
                              (progress.readSections || []).includes("protein-senior")
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <CheckCircle className="w-5 h-5" />
                            <span className="sr-only">
                              {(progress.readSections || []).includes("protein-senior")
                                ? "Merkitse osio lukemattomaksi"
                                : "Merkitse osio luetuksi"}
                            </span>
                          </button>            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold mb-2">Suositus yli 65-vuotiaille</h3>
                <p className="text-sm text-gray-700 mb-2">
                  1.2-1.5 grammaa per painokilo päivässä. Esim. 70 kg painavalle 84-105 g proteiinia/päivä.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Hyviä proteiininlähteitä:</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Kala ja kana (25-30 g proteiinia/100g)</li>
                  <li>• Maitotuotteet (rahka 10-12 g/100g)</li>
                  <li>• Kananmuna (6 g/kpl)</li>
                  <li>• Palkokasvit (linssit 9 g/100g keitettyinä)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {shouldShowYoungAdultContent && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Proteiinin tarve - Työikäiset</h2>
                          <button
                            onClick={() => toggleSection("protein-adult")}
                            aria-pressed={(progress.readSections || []).includes("protein-adult")}
                            className={`p-2 rounded-full transition-colors ${
                              (progress.readSections || []).includes("protein-adult")
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <CheckCircle className="w-5 h-5" />
                            <span className="sr-only">
                              {(progress.readSections || []).includes("protein-adult")
                                ? "Merkitse osio lukemattomaksi"
                                : "Merkitse osio luetuksi"}
                            </span>
                          </button>            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Suositus 18-64-vuotiaille</h3>
                <p className="text-sm text-gray-700">
                  0.8-1.2 grammaa per painokilo päivässä. Toipumisvaiheessa tarve voi olla suurempi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hydration */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Droplets className="w-6 h-6 text-blue-600 mr-2" />
            Nestetasapaino
          </h2>
          <div className="space-y-3">
            <p className="text-gray-700">
              Riittävä nesteiden saanti on erityisen tärkeää ennen toimenpidettä ja toipumisen aikana.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Juo vähintään 1,5-2 litraa nestettä päivässä</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Vesi on paras janojuoma</span>
              </li>
              {hasDiabetes && (
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-yellow-800">Vältä sokeroituja juomia</span>
                </li>
              )}
              {hasHeartDisease && (
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-red-800">Nesteen määrä voi olla rajoitettu - kysy lääkäriltä</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Supplements */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <PlusCircle className="w-6 h-6 text-indigo-600 mr-2" />
            Ravintolisät ja vitamiinit
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Keskustele lääkärin kanssa</AccordionTrigger>
              <AccordionContent>
                <p>
                  Jos käytät lääkärin suosittelemia tai itse hankittuja ravintolisiä (esim. vitamiinit, hivenaineet, rasvahappovalmisteet) tai kasvirohdoksia, keskustele niiden turvallisuudesta ja tarpeellisuudesta hoitavan lääkärisi tai sairaanhoitajan kanssa.
                </p>
                <p className="mt-2 text-red-700 font-medium">
                  Erityisesti kalaöljy- tai omega-3-valmisteiden käytöstä on tärkeä keskustella, sillä hoitava yksikkö antaa ohjeen niiden tauottamiseen ennen toimenpidettä.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>D-vitamiinisuositus</AccordionTrigger>
              <AccordionContent>
                <p className="font-semibold mb-2">Alle 75-vuotiaat:</p>
                <p>Saat ruoasta tarpeeksi D-vitamiinia, kun:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Juot päivittäin D-vitaminoituja maitoja tai kasvimaitoja.</li>
                  <li>Käytät päivittäin D-vitaminoitua rasvalevitettä.</li>
                  <li>Syöt kalaa 2-3 kertaa viikossa.</li>
                </ul>
                <p className="mt-2">
                  Jos et saa ruoasta tarpeeksi, ota <strong>10 mikrogrammaa (µg)</strong> D-vitamiinivalmistetta päivässä lokakuusta maaliskuuhun.
                </p>
                <p className="font-semibold mt-4 mb-2">Yli 75-vuotiaat:</p>
                <p>
                  Ota <strong>20 mikrogrammaa (µg)</strong> D-vitamiinivalmistetta päivässä, vuoden ympäri.
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Noudata tätä suositusta tai toimi lääkärisi antaman henkilökohtaisen ohjeen mukaan.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Protein Drinks & Powders */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Soup className="w-6 h-6 text-teal-600 mr-2" />
            Proteiinijuomat ja -jauheet
          </h2>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Kaupalliset proteiinijuomat</AccordionTrigger>
              <AccordionContent>
                <p className="font-semibold mb-2">Apteekin ravintojuomat:</p>
                <p>Apteekit myyvät täydennysravintojuomia (esim. Nutridrink®, Resource®, Fresubin®), jotka on tarkoitettu ruokailun täydentämiseen. Yksi pullollinen vastaa energialtaan noin lautasellista keittoa ja maitolasillista. Ne sisältävät monipuolisemmin vitamiineja ja kivennäisaineita kuin kaupan proteiinijuomat.</p>
                
                <p className="font-semibold mt-4 mb-2">Ruokakaupan proteiinijuomat:</p>
                <p>Myös ruokakaupoista löytyy laaja valikoima proteiinijuomia (esim. Pirkka®, Valio Profeel®, Arla®). Niiden ravintosisällöt vaihtelevat. Valitse juoma, joka sisältää runsaasti proteiinia.</p>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Vinkki:</strong> Jos paino laskee tahattomasti, lisää ruokavalioosi 1-2 rkl ruokaöljyä päivässä. Voit sekoittaa sen puuroon, jogurttiin tai muuhun ruokaan.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Itsevalmistetut proteiinijuomat (Reseptit)</AccordionTrigger>
              <AccordionContent>
                <div className="mb-4">
                  <h4 className="font-semibold">Rahkapirtelö (n. 6 dl)</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>1 prk (250g) maitorahkaa</li>
                    <li>2 dl maitoa tai täysmehua</li>
                    <li>1 banaani</li>
                    <li>1 dl hedelmäsosetta tai 2 dl marjoja</li>
                  </ul>
                  <p className="text-sm mt-1">Sekoita sauvasekoittimella. Voit lisätä hunajaa maun mukaan. Annos sisältää n. 380 kcal ja 30g proteiinia (maidolla).</p>
                </div>
                <div>
                  <h4 className="font-semibold">Smoothie (n. 6 dl)</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>2 dl jäisiä marjoja</li>
                    <li>1 banaani</li>
                    <li>2 dl maustamatonta jogurttia (rasvainen, esim. turkkilainen, jos tavoitteena painon nousu)</li>
                    <li>1 dl maitoa</li>
                  </ul>
                  <p className="text-sm mt-1">Sekoita sauvasekoittimella. Voit lisätä hunajaa maun mukaan.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Proteiini- ja heraproteiinijauheet</AccordionTrigger>
              <AccordionContent>
                <p>Proteiinijauheita (esim. Fast®, Leader®) myydään ruokakaupoissa ja urheiluliikkeissä. Myös maitojauhe sopii proteiinilisäksi.</p>
                <p className="font-semibold mt-2">Käyttöohje:</p>
                <p>Jauhe sekoittuu parhaiten kylmään nesteeseen. Voit lisätä sitä jogurttiin, juomiin tai jäähtyneeseen puuroon. Tehosekoittimessa lisää jauhe viimeisenä, jotta pirtelöstä tulee kuohkea. Yksi annos sisältää tyypillisesti 20-30g proteiinia.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>



        {/* External Links */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Link className="w-6 h-6 text-gray-800 mr-2" />
            Lisätietoa verkossa
          </h2>
          <div className="space-y-2">
            <a 
              href="https://www.ruokavirasto.fi/globalassets/teemat/terveytta-edistava-ruokavalio/ravitsemus--ja-ruokasuositukset/dieettioppaat/opas-ravitsemus-ikaantyneille.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              Ruokaviraston ravitsemusopas ikääntyneille <ExternalLink className="w-4 h-4 ml-1" />
              <span className="sr-only"> (avautuu uudessa välilehdessä)</span>
            </a>
          </div>
        </div>

        {/* Special dietary considerations */}
        {(hasDiabetes || hasHeartDisease || hasSleepApnea) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-amber-900">
              Erityisruokavalion huomiot
            </h2>
            
            {hasDiabetes && (
              <div className="mb-3">
                <h3 className="font-semibold text-amber-800 mb-2">Diabetes:</h3>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>• Säännöllinen ateriarytmi (3-4 tunnin välein)</li>
                  <li>• Hiilihydraattien laskeminen</li>
                  <li>• Verensokerin seuranta aterioiden yhteydessä</li>
                </ul>
              </div>
            )}
            
            {hasHeartDisease && (
              <div className="mb-3">
                <h3 className="font-semibold text-amber-800 mb-2">Sydänsairaus:</h3>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>• Suolan rajoitus (max 5 g/päivä)</li>
                  <li>• Tyydyttyneen rasvan vähentäminen</li>
                  <li>• Omega-3 rasvahapot (kalasta)</li>
                </ul>
              </div>
            )}
            
            {hasSleepApnea && (
              <div className="mb-3">
                <h3 className="font-semibold text-amber-800 mb-2">Uniapnea:</h3>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>• Painonhallinta erityisen tärkeää</li>
                  <li>• Vältä raskaita iltapaloja</li>
                  <li>• Alkoholin välttäminen illalla</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Meal planning */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="w-6 h-6 text-orange-600 mr-2" />
            Ateriasuunnittelu
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold mb-2">Päivän ateriarytmi</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>Aamupala:</strong> Puuroa/mysliä, proteiinia, hedelmiä</li>
                <li><strong>Lounas:</strong> Lautasmallin mukainen ateria</li>
                <li><strong>Välipala:</strong> Jogurtti, hedelmä tai pähkinöitä</li>
                <li><strong>Päivällinen:</strong> Kevyt, proteiinipitoinen</li>
                <li><strong>Iltapala:</strong> Tarvittaessa kevyt {hasDiabetes && "(huomioi verensokeri)"}</li>
              </ul>
            </div>
            
            <Button
              onClick={() => {
                setProgress({ ...progress, mealPlanCreated: true });
                localStorage.setItem("nutritionProgress", JSON.stringify({ ...progress, mealPlanCreated: true }));
              }}
              className="w-full"
              disabled={progress.mealPlanCreated}
            >
              {progress.mealPlanCreated ? "Ateriasuunnitelma luotu!" : "Merkitse suunnitelma tehdyksi"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NutritionPage;