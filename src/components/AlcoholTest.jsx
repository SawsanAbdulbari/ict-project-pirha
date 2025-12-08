// This file has the the alcohol test.
// The questions are based on the AUDIT test.
export const alcoholTestQuestions = [
  {
    id: 1,
    question: 'Kuinka usein juot olutta, viiniä tai muita alkoholijuomia? Ota mukaan myös ne kerrat, jolloin nautit vain pieniä määriä, esimerkiksi pullon keskiolutta tai tilkan viiniä.',
    options: [
      { label: '4 kertaa viikossa tai useammin', value: 4 },
      { label: '2-3 kertaa viikossa', value: 3 },
      { label: '2-4 kertaa kuussa', value: 2 },
      { label: 'Noin kerran kuussa tai harvemmin', value: 1 },
      { label: 'En koskaan', value: 0 },
    ],
  },
  {
    id: 2,
    question: 'Kuinka monta annosta alkoholia yleensä olet ottanut niinä päivinä, jolloin käytit alkoholia?',
    options: [
      { label: '10 tai enemmän', value: 4 },
      { label: '7-9 annosta', value: 3 },
      { label: '5-6 annosta', value: 2 },
      { label: '3-4 annosta', value: 1 },
      { label: '1-2 annosta', value: 0 },
    ],
  },
  {
    id: 3,
    question: 'Kuinka usein olet juonut kerralla kuusi tai useampia annoksia?',
    options: [
      { label: 'Päivittäin tai lähes päivittäin', value: 4 },
      { label: 'Kerran viikossa', value: 3 },
      { label: 'Kerran kuussa', value: 2 },
      { label: 'Harvemmin kuin kerran kuussa', value: 1 },
      { label: 'En koskaan', value: 0 },
    ],
  },
  {
    id: 4,
    question: 'Kuinka usein viimeisen vuoden aikana sinulle kävi niin, että et pystynyt lopettamaan alkoholinkäyttöä sen aloittamisen jälkeen?',
    options: [
      { label: 'Päivittäin tai lähes päivittäin', value: 4 },
      { label: 'Kerran viikossa', value: 3 },
      { label: 'Kerran kuussa', value: 2 },
      { label: 'Harvemmin kuin kerran kuussa', value: 1 },
      { label: 'Ei koskaan', value: 0 },
    ],
  },
  {
    id: 5,
    question: 'Kuinka usein viimeisen vuoden aikana et ole juomisesi vuoksi saanut tehtyä jotain, mikä tavallisesti kuuluu tehtäviisi?',
    options: [
      { label: 'Päivittäin tai lähes päivittäin', value: 4 },
      { label: 'Kerran viikossa', value: 3 },
      { label: 'Kerran kuussa', value: 2 },
      { label: 'Harvemmin kuin kerran kuussa', value: 1 },
      { label: 'Ei koskaan', value: 0 },
    ],
  },
  {
    id: 6,
    question: 'Kuinka usein viimeisen vuoden aikana runsaan juomisen jälkeen tarvitsit aamulla olutta tai muuta alkoholia päästäksesi paremmin liikkeelle?',
    options: [
      { label: 'Päivittäin tai lähes päivittäin', value: 4 },
      { label: 'Kerran viikossa', value: 3 },
      { label: 'Kerran kuussa', value: 2 },
      { label: 'Harvemmin kuin kerran kuussa', value: 1 },
      { label: 'En koskaan', value: 0 },
    ],
  },
  {
    id: 7,
    question: 'Kuinka usein viimeisen vuoden aikana tunsit syyllisyyttä tai katumusta juomisen jälkeen?',
    options: [
      { label: 'Päivittäin tai lähes päivittäin', value: 4 },
      { label: 'Kerran viikossa', value: 3 },
      { label: 'Kerran kuussa', value: 2 },
      { label: 'Harvemmin kuin kerran kuussa', value: 1 },
      { label: 'En koskaan', value: 0 },
    ],
  },
  {
    id: 8,
    question: 'Kuinka usein viime vuoden aikana sinulle kävi niin, että et juomisen vuoksi pystynyt muistamaan edellisen illan tapahtumia?',
    options: [
      { label: 'Päivittäin tai lähes päivittäin', value: 4 },
      { label: 'Kerran viikossa', value: 3 },
      { label: 'Kerran kuussa', value: 2 },
      { label: 'Harvemmin kuin kerran kuussa', value: 1 },
      { label: 'En koskaan', value: 0 },
    ],
  },
  {
    id: 9,
    question: 'Oletko itse tai onko joku muu satuttanut tai loukannut itseään sinun alkoholinkäyttösi seurauksena?',
    options: [
      { label: 'Kyllä, viimeisen vuoden aikana', value: 4 },
      { label: 'On, mutta ei viimeisen vuoden aikana', value: 2 },
      { label: 'Ei', value: 0 },
    ],
  },
  {
    id: 10,
    question: 'Onko joku läheisesi tai ystäväsi, lääkäri tai joku muu ollut huolissaan alkoholinkäytöstäsi tai ehdottanut että vähentäisit juomista?',
    options: [
      { label: 'On, viimeksi kuluneen vuoden aikana', value: 4 },
      { label: 'On, mutta ei viimeisen vuoden aikana', value: 2 },
      { label: 'Ei koskaan', value: 0 },
    ],
  },
];
// This function returns the result text based on the score.
export const getAlcoholTestResultText = (score) => {
  if (score <= 7) {
    return {
      title: 'Alkoholinkäyttö on hallinnassa.',
    };
  } else if (score <= 13) {
    return {
      title: 'Alkoholinkäyttö on niin runsasta, että siihen liittyy riskejä.',
    };
  } else {
    return {
      title: 'Päihderiippuvuus on todennäköinen. Alkoholinkäyttöä on vähennettävä.',
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
// This is the main component for the alcohol test.
export default function AlcoholTest({ onComplete }) {
  // This state variable stores the user's answers to the test questions.
  const [answers, setAnswers] = useState({});
  // This state variable stores the user's score on the test.
  const [score, setScore] = useState(0);
  // This state variable determines whether to show the test result or the test questions.
  const [showResult, setShowResult] = useState(false);
  // This function is called when the user changes their answer to a question.
  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };
  // This function is called when the user submits the test.
  const handleSubmit = (e) => {
    e.preventDefault();
    // This checks if the user has answered all the questions.
    if (Object.keys(answers).length !== alcoholTestQuestions.length) {
      toast.error('Vastaa kaikkiin kysymyksiin ennen lähettämistä');
      return;
    }
    // This calculates the user's score on the test.
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    setScore(totalScore);
    setShowResult(true);
    // This saves the user's test result to local storage.
    const newResult = {
      score: totalScore,
      date: new Date().toISOString(),
      answers: answers,
    };

    const existingResults = JSON.parse(localStorage.getItem('alcoholTestResult')) || [];
    localStorage.setItem('alcoholTestResult', JSON.stringify([...existingResults, newResult]));

    toast.success('Testi suoritettu!');
  };
  // This renders the test result.
  if (showResult) {
    const result = getAlcoholTestResultText(score);
    return (
      <Card className="max-w-2xl mx-auto my-8">
        <CardHeader>
          <CardTitle className="text-2xl">Testin tulos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-4">{score}/40</div>
            <h3 className={`text-2xl font-bold mb-2 ${result.color}`}>{result.title}</h3>
            <p className="text-muted-foreground">{result.description}</p>
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
            <Button onClick={() => downloadPDF(FORM_TYPES.ALCOHOL_TEST, { score, answers })} variant="outline">Lataa tulokset PDF-muodossa</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  // This renders the test questions.
  return (
    <Card className="max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-2xl">AUDIT-testi</CardTitle>
        <CardDescription>
          Testi mittaa alkoholin käytön astetta. Vastaa kaikkiin kysymyksiin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {alcoholTestQuestions.map((q) => (
            <div key={q.id} className="space-y-3">
              <Label className="text-base font-semibold">
                {q.id}. {q.question}
              </Label>
              <RadioGroup
                value={answers[q.id]?.toString()}
                onValueChange={(value) => handleAnswerChange(q.id, parseInt(value))}
                className="grid grid-cols-1 gap-4"
              >
                {q.options.map((option, idx) => (
                    <Label
                        key={idx}
                        htmlFor={`q${q.id}-${idx}`}
                        className={cn(
                            buttonVariants({ variant: 'outline', size: 'lg' }),
                            'flex items-center justify-start cursor-pointer text-left',
                            {
                                'bg-primary text-primary-foreground': answers[q.id] === option.value,
                            }
                        )}
                    >
                        <RadioGroupItem
                        value={option.value.toString()}
                        id={`q${q.id}-${idx}`}
                        className="sr-only"
                        />
                        {option.label}
                    </Label>
                ))}
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