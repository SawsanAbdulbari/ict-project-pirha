// This array contains the questions for the substance use screening test.
export const substanceTestQuestions = [
  { id: 1, question: 'Oletko koskaan käyttänyt huumeita tai lääkkeitä väärin?' },
  { id: 2, question: 'Onko sinulla ollut ongelmia huumeiden tai lääkkeiden käytön vuoksi?' },
  { id: 3, question: 'Oletko käyttänyt useampia huumeita tai lääkkeitä samanaikaisesti?' },
  { id: 4, question: 'Selviätkö viikkoa ilman päihdyttävien lääkkeiden tai huumeiden käyttöä?' },
  { id: 5, question: 'Oletko yrittänyt lopettaa tai vähentää huumeiden tai lääkkeiden käyttöä siinä onnistumatta?' },
  { id: 6, question: 'Onko sinulla ollut "mustia aukkoja" tai muistikatkoksia huumeiden tai lääkkeiden käytön jälkeen?' },
  { id: 7, question: 'Tunnetko syyllisyyttä tai häpeää huumeiden tai lääkkeiden käytöstäsi?' },
  { id: 8, question: 'Ovatko ystäväsi tai perheesi koskaan valittaneet huumeiden tai lääkkeiden käytöstäsi?' },
  { id: 9, question: 'Oletko laiminlyönyt velvollisuuksiasi huumeiden tai lääkkeiden käytön vuoksi?' },
  { id: 10, question: 'Oletko menettänyt ystäviä huumeiden tai lääkkeiden väärinkäytön vuoksi?' },
  { id: 11, question: 'Oletko joutunut vaikeuksiin töissä huumeiden tai lääkkeiden käytön vuoksi?' },
  { id: 12, question: 'Oletko joutunut pidätetyksi tai syytteeseen huumeiden tai lääkkeiden hallussapidosta tai käytöstä?' },
  { id: 13, question: 'Oletko kokenut vieroitusoireita, kun olet lopettanut huumeiden tai lääkkeiden käytön?' },
  { id: 14, question: 'Onko sinulla ollut lääketieteellisiä ongelmia huumeiden tai lääkkeiden käytön seurauksena (esim. muistinmenetys, hepatiitti, kouristukset, verenvuoto)?' },
  { id: 15, question: 'Oletko pyytänyt apua huumeiden tai lääkkeiden käyttöön liittyviin ongelmiin?' },
  { id: 16, question: 'Oletko ollut vieroitushoidossa huumeiden tai lääkkeiden käytön vuoksi?' },
  { id: 17, question: 'Onko sinulla ollut hallusinaatioita huumeiden tai lääkkeiden käytön seurauksena?' },
  { id: 18, question: 'Oletko tuntenut, että elämäsi on hallitsematonta huumeiden tai lääkkeiden käytön takia?' },
  { id: 19, question: 'Oletko koskaan yliannostanut huumeita tai lääkkeitä?' },
  { id: 20, question: 'Oletko koskaan käyttänyt huumeita tai lääkkeitä väärin estääksesi vieroitusoireita?' },
];
// This function takes the calculated score and returns an appropriate result title and description, indicating the level of risk and recommended actions.
export const getSubstanceTestResultText = (score) => {
  if (score >= 1 && score <= 5) {
    return {
      title: 'Ota yhteyttä terveysasemallesi neuvontaa varten',
    };
  } else if (score >= 6 && score <= 10) {
    return {
      title: 'Kuulut riskiryhmään ja hyödyt vieroitusohjelmasta',
    };
  } else if (score >= 11) {
    return {
      title: 'Huumeiden käyttösi on merkittävää ja tarvitset intensiivistä vieroitushoitoa',
    };
  } else {
    return {
      title: 'Ei merkittäviä ongelmia',
    };
  }
};

import { useState } from 'react';
import { Button, buttonVariants } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { downloadPDF, FORM_TYPES } from '../utils/pdfGenerator';
import { cn } from '../lib/utils';
// This component renders the substance use test.
export default function SubstanceTest({ onComplete }) {
  // These state variables are used to store the user's answers, score, and whether to show the result.
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  // This function updates the state when the user selects "Kyllä" (Yes) or "Ei" (No).
  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };
  // This function calculates the score based on the user's answers.
  // For most questions, a "Kyllä" answer adds a point, but for questions 4 and 5, an "Ei" answer adds a point.
  const calculateScore = (answers) => {
    let totalScore = 0;
    
    for (let i = 1; i <= 20; i++) {
      if (i === 4 || i === 5) {
        if (answers[i] === 'ei') {
          totalScore++;
        }
      } else {
        if (answers[i] === 'kyllä') {
          totalScore++;
        }
      }
    }
    
    return totalScore;
  };
  // This function is called when the user submits the test.
  // It validates that all questions are answered, calculates the score, saves the results to local storage, and triggers the display of the results page.
  const handleSubmit = (e) => {
    e.preventDefault();

    if (Object.keys(answers).length !== substanceTestQuestions.length) {
      toast.error('Vastaa kaikkiin kysymyksiin ennen lähettämistä');
      return;
    }

    const totalScore = calculateScore(answers);
    setScore(totalScore);
    setShowResult(true);

    const newResult = {
      score: totalScore,
      date: new Date().toISOString(),
      answers: answers,
    };

    const existingResults = JSON.parse(localStorage.getItem('substanceTestResult')) || [];
    localStorage.setItem('substanceTestResult', JSON.stringify([...existingResults, newResult]));

    toast.success('Testi suoritettu!');
  };
  // This conditional rendering shows either the results card or the question form based on showResult.
  if (showResult) {
    const result = getSubstanceTestResultText(score);
    return (
      // This is the results card, which displays the score, the result text, general advice, and the action buttons.
      <Card className="max-w-2xl mx-auto my-8">
        <CardHeader>
          <CardTitle className="text-2xl">Testin tulos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-4">{score}/20</div>
            <h3 className={`text-2xl font-bold mb-2 ${result.color}`}>{result.title}</h3>
            <p className="text-muted-foreground">{result.description}</p>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h4 className="font-semibold mb-2">Tärkeää tietoa:</h4>
            <p className="text-sm text-muted-foreground">
              Jos sinulla on huolta päihteiden käytöstäsi, älä epäröi hakea apua. Terveydenhuollon ammattilaiset voivat tarjota tukea ja ohjausta tilanteesi parantamiseksi.
            </p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => { setShowResult(false); setAnswers({}); }} className="flex-1">
              Tee testi uudelleen
            </Button>
            <Button onClick={() => onComplete(score)} className="flex-1">
                Takaisin
            </Button>
          </div>
          <div className="flex justify-center">
            <Button onClick={() => downloadPDF(FORM_TYPES.SUBSTANCE_TEST, { score, answers })} variant="outline">Lataa tulokset PDF-muodossa</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  // This is the question form, which maps over the questions and renders the "Kyllä" / "Ei" radio button options for each.
  return (
    <Card className="max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-2xl">Huumausaineet</CardTitle>
        <CardDescription>
          Vastaa kaikkiin kysymyksiin rehellisesti. Testi auttaa arvioimaan päihteiden käyttöä.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {substanceTestQuestions.map((q) => (
            <div key={q.id} className="space-y-3">
              <Label className="text-base font-semibold">
                {q.id}. {q.question}
              </Label>
              <RadioGroup
                value={answers[q.id]}
                onValueChange={(value) => handleAnswerChange(q.id, value)}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                    htmlFor={`q${q.id}-yes`}
                    className={cn(
                        buttonVariants({ variant: 'outline', size: 'lg' }),
                        'flex items-center justify-start cursor-pointer text-center',
                        {
                            'bg-primary text-primary-foreground': answers[q.id] === 'kyllä',
                        }
                    )}
                >
                    <RadioGroupItem value="kyllä" id={`q${q.id}-yes`} className="sr-only" />
                    Kyllä
                </Label>
                <Label
                    htmlFor={`q${q.id}-no`}
                    className={cn(
                        buttonVariants({ variant: 'outline', size: 'lg' }),
                        'flex items-center justify-start cursor-pointer text-center',
                        {
                            'bg-primary text-primary-foreground': answers[q.id] === 'ei',
                        }
                    )}
                >
                    <RadioGroupItem value="ei" id={`q${q.id}-no`} className="sr-only" />
                    Ei
                </Label>
              </RadioGroup>
            </div>
          ))}

          <Button type="submit" className="w-full" size="lg">
            Lähetä vastaukset
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
