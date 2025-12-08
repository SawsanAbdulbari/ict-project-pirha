// This array contains the questions for the Fagerström Test for Nicotine Dependence.
export const smokingTestQuestions = [
  {
    id: 1,
    question: 'Kuinka pian heräämisen jälkeen tupakoit ensimmäisen kerran?',
    options: [
      { label: 'alle 5 minuuttia', value: 3 },
      { label: '6-30 minuuttia', value: 2 },
      { label: '31-60 minuuttia', value: 1 },
      { label: 'yli 60 minuuttia', value: 0 },
    ],
  },
  {
    id: 2,
    question: 'Onko sinusta vaikeaa olla tupakoimatta tiloissa, joissa se on kiellettyä?',
    options: [
      { label: 'Kyllä', value: 1 },
      { label: 'Ei', value: 0 },
    ],
  },
  {
    id: 3,
    question: 'Mistä tupakointikerrasta sinun olisi vaikeinta luopua?',
    options: [
      { label: 'aamun ensimmäisestä', value: 1 },
      { label: 'jostain muusta', value: 0 },
    ],
  },
  {
    id: 4,
    question: 'Kuinka monta savuketta poltat vuorokaudessa?',
    options: [
      { label: '1-10 savuketta', value: 0 },
      { label: '11-20 savuketta', value: 1 },
      { label: '21-30 savuketta', value: 2 },
      { label: 'yli 30 savuketta', value: 3 },
    ],
  },
  {
    id: 5,
    question: 'Tupakoitko useammin aamupäivällä kuin muina aikoina?',
    options: [
      { label: 'Kyllä', value: 1 },
      { label: 'Ei', value: 0 },
    ],
  },
  {
    id: 6,
    question: 'Tupakoitko silloinkin, kun olet niin sairas, että joudut olemaan vuoteessa suurimman osan päivästä?',
    options: [
      { label: 'Kyllä', value: 1 },
      { label: 'Ei', value: 0 },
    ],
  },
];
// This function takes a score and returns a corresponding title and description that classifies the level of nicotine dependence.
export const getSmokingTestResultText = (score) => {
  if (score <= 3) {
    return {
      title: 'Vähäinen tai ei lainkaan riippuvuutta',
    };
  } else if (score <= 6) {
    return {
      title: 'Kohtalainen riippuvuus',
    };
  } else {
    return {
      title: 'Voimakas riippuvuus',
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
// This component renders the smoking dependency test.
export default function SmokingTest({ onComplete }) {
  // These state variables are used to store the user's answers, score, and whether to show the result.
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  // This function updates the state when the user selects an answer.
  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };
  // This function is called when the user submits the test.
  const handleSubmit = (e) => {
    e.preventDefault();
    // It prevents form submission if not all questions are answered.
    if (Object.keys(answers).length !== smokingTestQuestions.length) {
      toast.error('Vastaa kaikkiin kysymyksiin ennen lähettämistä');
      return;
    }
    // It calculates the total score.
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    setScore(totalScore);
    setShowResult(true);
    // It saves the result to local storage to keep a history of test results.
    const newResult = {
      score: totalScore,
      date: new Date().toISOString(),
      answers: answers,
    };

    const existingResults = JSON.parse(localStorage.getItem('smokingTestResult')) || [];
    localStorage.setItem('smokingTestResult', JSON.stringify([...existingResults, newResult]));
    // It sets showResult to true to display the results view.
    toast.success('Testi suoritettu!');
  };
  // This conditional rendering shows either the results card or the question form based on showResult.
  if (showResult) {
    const result = getSmokingTestResultText(score);
    return (
      // This is the results card, which displays the score, the result text, the static informational section about the benefits of quitting, and the action buttons.
      <Card className="max-w-2xl mx-auto my-8">
        <CardHeader>
          <CardTitle className="text-2xl">Testin tulos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-4">{score}/10</div>
            <h3 className={`text-2xl font-bold mb-2 ${result.color}`}>{result.title}</h3>
            <p className="text-muted-foreground">{result.description}</p>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h4 className="font-semibold mb-2">Tupakoinnin lopettamisen hyödyt:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Haavan paraneminen nopeutuu</li>
              <li>Haavojen tulehtuminen vähenee</li>
              <li>Hengitys helpottuu ja keuhkokuumeen vaara vähenee</li>
              <li>Sydän- ja aivoinfarktin sekä keuhkoveritulpan vaara vähenee</li>
              <li>Hoitoaika sairaalassa lyhenee</li>
            </ul>
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
            <Button onClick={() => downloadPDF(FORM_TYPES.SMOKING_TEST, { score, answers })} variant="outline">Lataa tulokset PDF-muodossa</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  // This is the question form, which maps over the smokingTestQuestions array to render each question and its radio button options.
  return (
    <Card className="max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-2xl">Tupakkariippuvuustesti</CardTitle>
        <CardDescription>
          Testi mittaa tupakoinnin aiheuttaman nikotiiniriippuvuuden astetta. Vastaa kaikkiin kysymyksiin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {smokingTestQuestions.map((q) => (
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
                            'flex items-center justify-start cursor-pointer text-center',
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
