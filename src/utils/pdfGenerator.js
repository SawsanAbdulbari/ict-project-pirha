// This file provides utilities for generating personalized PDF documents for various content types (e.g., exercise plans, test results) using `jspdf`.
import { jsPDF } from 'jspdf';
import { getUserProfile, getAgeGroupDisplay } from "./userProfile";
import { alcoholTestQuestions } from '../components/AlcoholTest';
import { smokingTestQuestions } from '../components/SmokingTest';
import { substanceTestQuestions } from '../components/SubstanceTest';

// This object defines the different types of PDF forms that can be generated, serving as an enumeration for consistency.
export const FORM_TYPES = {
  EXERCISE_PLAN: 'exercise-plan',
  NUTRITION_PLAN: 'nutrition-plan',
  MENTAL_WELLBEING: 'mental-wellbeing',
  SUBSTANCE_PLAN: 'substance-plan',
  DISEASE_MANAGEMENT: 'disease-management',
  SUBSTANCE_TEST: 'substance-test',
  ALCOHOL_TEST: 'alcohol-test',
  SMOKING_TEST: 'smoking-test'
};

// These functions are imported (or duplicated here from their respective component files) to provide consistent text results for the addiction tests within the PDF.
export const getSubstanceTestResultText = (score) => {
    if (score >= 1 && score <= 5) {
      return {
        title: 'Ota yhteyttä terveysasemallesi neuvontaa varten',
        description: 'Vastauksesi viittaavat mahdolliseen ongelmaan päihteiden käytössä. Suosittelemme ottamaan yhteyttä terveysasemallesi saadaksesi neuvontaa ja tukea.',
      };
    } else if (score >= 6 && score <= 10) {
      return {
        title: 'Kuulut riskiryhmään ja hyödyt vieroitusohjelmasta',
        description: 'Vastauksesi osoittavat, että kuulut riskiryhmään. Hyötyisit vieroitusohjelmasta. Ota yhteyttä terveydenhuollon ammattilaiseen mahdollisimman pian.',
      };
    } else if (score >= 11) {
      return {
        title: 'Huumeiden käyttösi on merkittävää ja tarvitset intensiivistä vieroitushoitoa',
      
        description: 'Vastauksesi osoittavat merkittävää päihteiden käyttöä. Tarvitset intensiivistä vieroitushoitoa. Ole yhteydessä terveydenhuollon ammattilaiseen välittömästi.',
      };
    } else {
      return {
        title: 'Ei merkittäviä ongelmia',
        description: 'Vastauksesi eivät viittaa merkittäviin ongelmiin päihteiden käytössä.',
      };
    }
  };
  
export const getSmokingTestResultText = (score) => {
    if (score <= 3) {
        return {
        title: 'Vähäinen tai ei lainkaan riippuvuutta',
        description: 'Nikotiiniriippuvuutesi on vähäinen. Tupakoinnin lopettaminen on sinulle helpompaa kuin voimakkaasti riippuvaisille.',
        };
    } else if (score <= 6) {
        return {
        title: 'Kohtalainen riippuvuus',
        description: 'Sinulla on kohtalainen nikotiiniriippuvuus. Tupakoinnin lopettaminen voi vaatia tukea ja vieroitushoitoa.',
        };
        } else {
        return {
        title: 'Voimakas riippuvuus',
        description: 'Sinulla on voimakas nikotiiniriippuvuus. Suosittelemme vahvasti hakeutumaan vieroitushoitoon ja käyttämään nikotiinikorvaushoitoa.',
        };
    }
};

export const getAlcoholTestResultText = (score) => {
    if (score <= 7) {
        return {
        title: 'Alkoholinkäyttö on hallinnassa.',
        description: '',
        };
    } else if (score <= 13) {
        return {
        title: 'Alkoholinkäyttö on niin runsasta, että siihen liittyy riskejä.',
        description: '',
        };
    } else {
        return {
        title: 'Päihderiippuvuus on todennäköinen. Alkoholinkäyttöä on vähennettävä.',
        description: '',
        };
    }
};

// This async function orchestrates the PDF generation and download.
export const downloadPDF = async (formType, userData = {}) => {
  try {
    // This maps `formType` to human-readable titles for the PDF.
    const titles = {
      'exercise-plan': 'Liikuntasuunnitelma',
      'nutrition-plan': 'Ravitsemussuunnitelma',
      'mental-wellbeing': 'Henkisen jaksamisen opas',
      'substance-plan': 'Päihteiden käytön vähentämissuunnitelma',
      'disease-management': 'Sairauksien hallintasuunnitelma',
      'substance-test': 'Huumausainetestin tulokset',
      'alcohol-test': 'AUDIT-testin tulokset',
      'smoking-test': 'Tupakkariippuvuustestin tulokset'
    };

    const title = titles[formType] || 'Kuntoutumisopas';
    // This object is constructed to aggregate all necessary data for the PDF content.
    const personalizedContent = {
      ageGroup: userData.age || 'under_65',
      hasLowActivity: userData.low_activity || false,
      hasHeartDisease: userData.conditions?.includes('heart_disease') || false,
      hasDiabetes: userData.conditions?.includes('diabetes') || false,
      hasSleepApnea: userData.conditions?.includes('sleep_apnea') || false,
      hasMentalHealth: userData.conditions?.includes('mental_health') || false,
      includesSmoking: userData.smoking || false,
      includesAlcohol: userData.alcohol || false,
      includesSubstance: userData.substance || false,
      conditions: userData.conditions || [],
      score: userData.score,
      answers: userData.answers || {}
    };

    await generatePDF(formType, title, personalizedContent);
    
    return { success: true };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};

// This async function creates the actual PDF content based on the `type`, `title`, and `personalizedContent`.
export const generatePDF = async (type, title, personalizedContent = {}) => {
  // This initializes jsPDF with various options for document metadata and accessibility.
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    floatPrecision: 16, // or "smart"
    compress: true,
    tagged: true,
    accessibilityProperties: {
        title: title,
        subject: `Henkilökohtainen kuntoutumisopas: ${title}`,
        author: "PIRHA Kuntoutumisopas",
        creator: "PIRHA Kuntoutumisopas",
        keywords: ['kuntoutuminen', 'terveys', 'opas', 'suunnitelma', 'pirha'],
        language: 'fi-FI'
    }
  });

  let yPos = 20;
  const maxWidth = 180;
  const margin = 15;

  // This helper function manages page breaks automatically.
  const addPageIfNeeded = () => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, margin, yPos, { role: 'H1' });
  yPos += 10;
  
  const userProfile = getUserProfile();
  if (userProfile?.hasCompletedSurvey) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text("Personoitu sinulle", margin, yPos);
      yPos += 5;
      doc.text(`Ikäryhmä: ${getAgeGroupDisplay(userProfile.ageGroup)}`, margin, yPos);
      yPos += 5;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Luotu: ${new Date().toLocaleDateString('fi-FI')}`, 195, 20, { align: 'right' });
  yPos += 5;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, 195, yPos);
  yPos += 10;
  // This helper function formats bulleted lists.
  const addList = (items) => {
    items.forEach(item => {
        addPageIfNeeded();
        const lines = doc.splitTextToSize(`• ${item}`, maxWidth - 5);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5;
    });
    yPos += 5;
  };
  // This helper function creates titled sections within the PDF.
  const addSection = (sectionTitle, content) => {
    addPageIfNeeded();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(sectionTitle, margin, yPos, { role: 'H2' });
    yPos += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    content();
  }
  // This function formats and displays test questions and user answers.
  const addAnswersSection = (questions, answers) => {
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Vastauksesi:", margin, yPos);
    yPos += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    questions.forEach(q => {
      addPageIfNeeded();
      const questionText = `${q.id}. ${q.question}`;
      let answerText = 'Ei vastausta';
      const answerValue = answers[q.id];

      if (answerValue !== undefined) {
        if (q.options) {
          const selectedOption = q.options.find(opt => opt.value === answerValue);
          answerText = selectedOption ? selectedOption.label : 'Tuntematon vastaus';
        } else {
          // For substance test which has simple yes/no
          answerText = answerValue.charAt(0).toUpperCase() + answerValue.slice(1);
        }
      }
      
      const questionLines = doc.splitTextToSize(questionText, maxWidth);
      doc.setFont("helvetica", "bold");
      doc.text(questionLines, margin, yPos);
      yPos += questionLines.length * 4;

      const answerLines = doc.splitTextToSize(`Vastaus: ${answerText}`, maxWidth);
      doc.setFont("helvetica", "normal");
      doc.text(answerLines, margin + 5, yPos);
      yPos += answerLines.length * 4 + 5;
    });
  };
  // This function generates a generic table, typically for daily tracking (e.g., exercise or nutrition logs).
  const addTrackingTable = (tableTitle, columns) => {
    yPos += 10;
    addPageIfNeeded();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(tableTitle, margin, yPos);
    yPos += 8;
    
    const tableHeaders = columns;
    const tableColumnWidths = [20, ...Array(columns.length - 1).fill((maxWidth - 20) / (columns.length - 1))];
    const rowHeight = 10;
    const headerHeight = 12;

    // Draw header
    addPageIfNeeded();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setLineWidth(0.5);
    
    let currentX = margin;
    tableHeaders.forEach((header, i) => {
        doc.rect(currentX, yPos, tableColumnWidths[i], headerHeight);
        doc.text(header, currentX + 2, yPos + 7);
        currentX += tableColumnWidths[i];
    });
    yPos += headerHeight;

    // Draw 14 rows for 2 weeks
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (let day = 1; day <= 14; day++) {
        if (yPos + rowHeight > 280) { // Check for page break before drawing a row
            doc.addPage();
            yPos = 20;
             // Redraw headers on new page
            currentX = margin;
            tableHeaders.forEach((header, i) => {
                doc.rect(currentX, yPos, tableColumnWidths[i], headerHeight);
                doc.text(header, currentX + 2, yPos + 7);
                currentX += tableColumnWidths[i];
            });
            yPos += headerHeight;
        }

        currentX = margin;
        doc.rect(currentX, yPos, tableColumnWidths[0], rowHeight);
        doc.text(String(day), currentX + 8, yPos + 7);
        currentX += tableColumnWidths[0];

        for (let i = 1; i < tableHeaders.length; i++) {
            doc.rect(currentX, yPos, tableColumnWidths[i], rowHeight);
            currentX += tableColumnWidths[i];
        }
        yPos += rowHeight;
    }
     yPos += 5;
  };
  // This is the central control flow for populating the PDF based on `formType`.
  switch (type) {
    // This case adds personalized exercise recommendations and a tracking table based on age.
    case FORM_TYPES.EXERCISE_PLAN:
      addSection("Henkilökohtainen liikuntasuunnitelma", () => {
        if (personalizedContent.ageGroup === 'over_65') {
            doc.setFontSize(12).setFont("helvetica", "bold").text("Ikääntyneille (65+ vuotta)", margin, yPos, { role: 'H3' });
            yPos += 8;
            doc.setFontSize(12).setFont("helvetica", "bold").text("Suositukset:", margin, yPos, { role: 'H4' });
            yPos += 6;
            doc.setFont("helvetica", "normal");
            addList([
                "Kestävyysliikunta: 2,5 tuntia reipasta TAI 1 tunti 15 minuuttia rasittavaa liikuntaa viikossa",
                "Lihaskuntoharjoittelu: Vähintään 2 kertaa viikossa",
                "Tasapaino ja notkeys: Vähintään 2 kertaa viikossa - erityisen tärkeää kaatumisten ehkäisyssä",
            ]);
            doc.setFontSize(12).setFont("helvetica", "bold").text("Erityishuomiot:", margin, yPos, { role: 'H4' });
            yPos += 6;
            doc.setFont("helvetica", "normal");
            addList([
                "Aloita maltillisesti ja lisää kuormitusta asteittain",
                "Tasapainoharjoitukset ovat erityisen tärkeitä",
                "Muista riittävä palautuminen harjoitusten välillä",
            ]);
        } else {
            doc.setFontSize(12).setFont("helvetica", "bold").text("Työikäisille (18-64 vuotta)", margin, yPos, { role: 'H3' });
            yPos += 8;
            doc.setFontSize(12).setFont("helvetica", "bold").text("Suositukset:", margin, yPos, { role: 'H4' });
            yPos += 6;
            doc.setFont("helvetica", "normal");
            addList([
                "Kestävyysliikunta: 2,5 tuntia reipasta TAI 1 tunti 15 minuuttia rasittavaa liikuntaa viikossa",
                "Lihaskuntoharjoittelu: Vähintään 2 kertaa viikossa, kaikki suuret lihasryhmät",
                "Tauot istumiseen: Vältä pitkiä istumisjaksoja",
            ]);
        }
      });
      addTrackingTable("Päivittäinen liikuntapäiväkirja (14 päivää)", ["Päivä", "Liikunnan tyyppi", "Kesto (min)", "Huomiot/Fiilis"]);
      break;
    // This case adds general nutrition advice and a tracking table.
    case FORM_TYPES.NUTRITION_PLAN:
        addSection("Henkilökohtainen ravitsemussuunnitelma", () => {
            let text = "Hyvä ravitsemustila vähentää toimenpiteeseen liittyvää komplikaatioriskiä sekä edistää toipumista ja kuntoutumista. Mikäli on todettu, että ravitsemustilasi ei ole hyvä, aloita muutosten tekeminen heti. Ravitsemustilan kohentamiseen ei riitä muutama päivä.";
            let lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 5 + 5;

            doc.setFontSize(12).setFont("helvetica", "bold").text("Ruokailu", margin, yPos, { role: 'H3' });
            yPos += 6;
            doc.setFont("helvetica", "normal");
            addList([
                "Syö säännöllisesti aamupala, lounas, päivällinen ja iltapala.",
                "Ota tarvittaessa välipaloja estääksesi tahaton laihtuminen.",
                "Koosta ateriat ja välipalat monipuolisesti lautasmallin mukaan.",
            ]);

            doc.setFontSize(12).setFont("helvetica", "bold").text("Ravintolisät", margin, yPos, { role: 'H3' });
            yPos += 6;
            doc.setFont("helvetica", "normal");
            text = "Keskustele ravintolisien (esim. vitamiinit, hivenaineet) turvallisuudesta ja tarpeellisuudesta hoitavan lääkärisi tai sairaanhoitajan kanssa.";
            lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 5 + 5;
        });
        addTrackingTable("Päivittäinen ravitsemuspäiväkirja (14 päivää)", ["Päivä", "Aamiainen", "Lounas", "Päivällinen", "Välipalat"]);
        break;
    // This case adds simple mental wellbeing advice.
    case FORM_TYPES.MENTAL_WELLBEING:
        addSection("Henkisen jaksamisen opas", () => {
            let text = "Sairastuminen ja tuleva toimenpide vaikuttavat arjessa selviytymiseen. Tämä kaikki saattaa heikentää toiminta- ja keskittymiskykyä hetkellisesti. Mieli sopeutuu muuttuneeseen elämäntilanteeseen vähitellen.";
            let lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 5 + 5;

            doc.setFontSize(12).setFont("helvetica", "bold").text("Mikä auttaa sinua jaksamaan?", margin, yPos, { role: 'H3' });
            yPos += 6;
            doc.setFont("helvetica", "normal");
            addList([
                "Puhu läheistesi kanssa.",
                "Kirjoita ajatuksiasi paperille.",
                "Riittävä uni on tärkeää.",
                "Ulkoile ja liiku kun vointisi sen sallii.",
                "Opettele rentoutumaan.",
                "Huumori on myös tärkeä voimavara.",
            ]);
        });
        break;
    // This case conditionally adds information and advice for smoking, alcohol, and other substance use, along with a tracking table.
    case FORM_TYPES.SUBSTANCE_PLAN:
        addSection("Päihteiden käytön vähentämis- ja lopettamissuunnitelma", () => {
            if (personalizedContent.includesSmoking) {
                doc.setFontSize(12).setFont("helvetica", "bold").text("Tupakoinnin lopettaminen", margin, yPos, { role: 'H3' });
                yPos += 6;
                doc.setFont("helvetica", "normal");
                let text = "Tupakointi heikentää merkittävästi hoitotuloksia. Lopettamalla tupakoinnin mahdollisimman varhain ennen hoitoasi parannat toipumisennustettasi. Lyhyestäkin savuttomuudesta on hyötyä.";
                let lines = doc.splitTextToSize(text, maxWidth);
                doc.text(lines, margin, yPos);
                yPos += lines.length * 5 + 5;
                doc.setFontSize(12).setFont("helvetica", "bold").text("Lopettamisen keinoja:", margin, yPos, { role: 'H4' });
                yPos += 6;
                doc.setFont("helvetica", "normal");
                addList([
                    "Nikotiinikorvaushoito (laastari, purukumi, imeskelytabletti)",
                    "Reseptilääkkeet (varenikliini, bupropioni)",
                    "Käyttäytymisterapia ja vertaistuki",
                    "Stumppi-ohjelma: stumppi.fi",
                ]);
            }
            if (personalizedContent.includesAlcohol) {
                doc.setFontSize(12).setFont("helvetica", "bold").text("Alkoholin käyttö", margin, yPos, { role: 'H3' });
                yPos += 6;
                doc.setFont("helvetica", "normal");
                let text = "Toimenpidettä odottaessa on turvallisinta pidättäytyä alkoholin käytöstä. Toimenpidettä edeltävänä päivänä ja toimenpidepäivänä alkoholin käyttö on kielletty.";
                let lines = doc.splitTextToSize(text, maxWidth);
                doc.text(lines, margin, yPos);
                yPos += lines.length * 5 + 5;
                doc.setFontSize(12).setFont("helvetica", "bold").text("Alkoholin vaikutukset:", margin, yPos, { role: 'H4' });
                yPos += 6;
                doc.setFont("helvetica", "normal");
                addList([
                    "Heikentää immuunijärjestelmää",
                    "Lisää verenvuodon riskiä",
                    "Vaikuttaa anestesia-aineiden toimintaan",
                    "Hidastaa haavan paranemista",
                ]);
            }
            if (personalizedContent.includesSubstance) {
                doc.setFontSize(12).setFont("helvetica", "bold").text("Muiden päihteiden käyttö", margin, yPos, { role: 'H3' });
                yPos += 6;
                doc.setFont("helvetica", "normal");
                let text = "Minkä tahansa päihteen säännöllinen käyttö voi vaikuttaa negatiivisesti toipumiseesi. On tärkeää keskustella lääkärin kanssa kaikesta päihteiden käytöstä.";
                let lines = doc.splitTextToSize(text, maxWidth);
                doc.text(lines, margin, yPos);
                yPos += lines.length * 5 + 5;
            }

            doc.setFontSize(12).setFont("helvetica", "bold").text("Tärkeää", margin, yPos, { role: 'H3' });
            yPos += 6;
            doc.setFont("helvetica", "normal");
            let text = "Jos käytät päihteitä säännöllisesti tai runsaasti, älä lopeta äkillisesti. Keskustele lääkärin kanssa turvallisesta lopettamisesta.";
            let lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 5 + 5;
            text = "Rehellisyys päihteiden käytöstä on tärkeää turvallisuutesi vuoksi. Hoitohenkilökunta ei tuomitse vaan auttaa.";
            lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 5 + 5;

            doc.setFontSize(12).setFont("helvetica", "bold").text("Tukea ja apua", margin, yPos, { role: 'H3' });
            yPos += 6;
            doc.setFont("helvetica", "normal");
            if (personalizedContent.includesSmoking) {
                doc.setFontSize(12).setFont("helvetica", "bold").text("Tupakoinnin lopettaminen:", margin, yPos, { role: 'H4' });
                yPos += 6;
                doc.setFont("helvetica", "normal");
                addList([
                    "Stumppi.fi - Online-tuki",
                    "Terveyskeskus - Nikotiinikorvaushoito",
                    "Apteekit - Neuvonta ja tuotteet",
                ]);
            }
            if (personalizedContent.includesAlcohol) {
                doc.setFontSize(12).setFont("helvetica", "bold").text("Alkoholiongelmat:", margin, yPos, { role: 'H4' });
                yPos += 6;
                doc.setFont("helvetica", "normal");
                addList([
                    "A-klinikka - Päihdepalvelut",
                    "AA-ryhmät - Vertaistuki",
                    "Päihdelinkki.fi - Online-palvelut",
                ]);
            }
            if (personalizedContent.includesSubstance) {
                doc.setFontSize(12).setFont("helvetica", "bold").text("Huumausaineongelmat:", margin, yPos, { role: 'H4' });
                yPos += 6;
                doc.setFont("helvetica", "normal");
                addList([
                    "Irti Huumeista ry - Vertaistuki ja neuvonta",
                    "A-klinikka - Päihdepalvelut",
                    "Tukikohta ry - Kuntoutuspalvelut",
                ]);
            }
        });
        addTrackingTable("Päivittäinen päihteiden käytön päiväkirja (14 päivää)", ["Päivä", "Määrä", "Tilanne/Tunne", "Huomiot"]);
        break;
    // This case adds general information for diabetes, sleep apnea, and oral health.
    case FORM_TYPES.DISEASE_MANAGEMENT:
        addSection("Sairauksien hallintasuunnitelma", () => {
            doc.setFontSize(12).setFont("helvetica", "bold").text("Diabetes", margin, yPos, { role: 'H3' });
            yPos += 6;
            doc.setFont("helvetica", "normal");
            let text = "Huono verensokeritasapaino altistaa tulehduksille, tukoksille ja muille komplikaatioille. Verensokereissa tavoitellaan tasoa 3,9-10 mmol/l.";
            let lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 5 + 5;

            doc.setFontSize(12).setFont("helvetica", "bold").text("Uniapnea", margin, yPos, { role: 'H3' });
            yPos += 6;
            doc.setFont("helvetica", "normal");
            text = "Jos epäilet itse tai puolisosi epäilee sinun sairastavan uniapneaa, hakeudu lääkärin vastaanotolle. Jos Sinulla on todettu uniapnea ja sen hoidossa on haasteita, ota yhteyttä hoitavaan yksikköön.";
            lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 5 + 5;

            doc.setFontSize(12).setFont("helvetica", "bold").text("Suun terveys", margin, yPos, { role: 'H3' });
            yPos += 6;
            doc.setFont("helvetica", "normal");
            text = "Hoitamattomat hampaat ja iensairaudet altistavat tulehduksille mm. leikkauksen jälkeen tai syöpälääkehoitojen aikana. Hammaslääkärillä ja suuhygienistillä onkin syytä käydä hyvissä ajoin ennen leikkaukseen tai syöpälääkehoitoon tuloa.";
            lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 5 + 5;
        });
        break;
    // These cases display test results, including score, interpretation, and the user's answers.
    case FORM_TYPES.ALCOHOL_TEST:
        addSection(title, () => {
            const result = getAlcoholTestResultText(personalizedContent.score);
            doc.setFontSize(16).setFont("helvetica", "bold").text(`Pistemäärä: ${personalizedContent.score}/40`, margin, yPos);
            yPos += 10;
            doc.setFontSize(14).setFont("helvetica", "bold").text(result.title, margin, yPos);
            yPos += 8;
            doc.setFontSize(12).setFont("helvetica", "normal");
            const lines = doc.splitTextToSize(result.description, maxWidth);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 5 + 5;
            addAnswersSection(alcoholTestQuestions, personalizedContent.answers);
        });
        break;

    case FORM_TYPES.SMOKING_TEST:
        addSection(title, () => {
            const result = getSmokingTestResultText(personalizedContent.score);
            doc.setFontSize(16).setFont("helvetica", "bold").text(`Pistemäärä: ${personalizedContent.score}/10`, margin, yPos);
            yPos += 10;
            doc.setFontSize(14).setFont("helvetica", "bold").text(result.title, margin, yPos);
            yPos += 8;
            doc.setFontSize(12).setFont("helvetica", "normal");
            let lines = doc.splitTextToSize(result.description, maxWidth);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 5 + 10;

            doc.setFontSize(12).setFont("helvetica", "bold").text("Tupakoinnin lopettamisen hyödyt:", margin, yPos, { role: 'H3' });
            yPos += 6;
            doc.setFont("helvetica", "normal");
            addList([
                "Haavan paraneminen nopeutuu",
                "Haavojen tulehtuminen vähenee",
                "Hengitys helpottuu ja keuhkokuumeen vaara vähenee",
                "Sydän- ja aivoinfarktin sekä keuhkoveritulpan vaara vähenee",
                "Hoitoaika sairaalassa lyhenee",
            ]);
            addAnswersSection(smokingTestQuestions, personalizedContent.answers);
        });
        break;
    
    case FORM_TYPES.SUBSTANCE_TEST:
        addSection(title, () => {
            const result = getSubstanceTestResultText(personalizedContent.score);
            doc.setFontSize(16).setFont("helvetica", "bold").text(`Pistemäärä: ${personalizedContent.score}/20`, margin, yPos);
            yPos += 10;
            doc.setFontSize(14).setFont("helvetica", "bold").text(result.title, margin, yPos);
            yPos += 8;
            doc.setFontSize(12).setFont("helvetica", "normal");
            let lines = doc.splitTextToSize(result.description, maxWidth);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 5 + 10;

            doc.setFontSize(12).setFont("helvetica", "bold").text("Tärkeää tietoa:", margin, yPos, { role: 'H3' });
            yPos += 6;
            doc.setFont("helvetica", "normal");
            let text = "Jos sinulla on huolta päihteiden käytöstäsi, älä epäröi hakea apua. Terveydenhuollon ammattilaiset voivat tarjota tukea ja ohjausta tilanteesi parantamiseksi.";
            lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 5 + 5;
            addAnswersSection(substanceTestQuestions, personalizedContent.answers);
        });
        break;

    default:
        const lines = doc.splitTextToSize("Tälle osiolle ei ole vielä luotu PDF-tulostetta.", maxWidth);
        doc.text(lines, margin, yPos);
        yPos += lines.length * 5;
  }
  // This saves the generated PDF with a descriptive filename.
  doc.save(`${type.replace(/-/g, '_')}_${new Date().getTime()}.pdf`);
};
