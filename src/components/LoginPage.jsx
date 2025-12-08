// This component renders the login page.
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { KeyRound, LogIn } from 'lucide-react';

// The LoginPage component receives a function to handle the successful login event as a prop.
const LoginPage = ({ onLogin }) => {
    // These state variables are used to control the input fields.
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // This function is called on form submission.
    const handleLogin = (e) => {
        e.preventDefault();
        // This is a hardcoded check for the username and password.
        if (username === 'demo' && password === 'demo') {
            // If the login is successful, call the onLogin prop and show a success toast.
            onLogin(username);
            toast.success('Kirjautuminen onnistui!');
        } else {
            // If the login is unsuccessful, show an error toast.
            toast.error('Väärä käyttäjätunnus tai salasana');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm shadow-xl border-gray-200 mt-[-64px]">
                <CardHeader className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                        <KeyRound className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">Kirjaudu sisään</CardTitle>
                    <CardDescription>Käytä käyttäjätunnusta 'demo' ja salasanaa 'demo'</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* The form for the login. */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Käyttäjätunnus</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="demo"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Salasana</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="demo"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="text-base"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-base py-6">
                            <LogIn className="mr-2 h-5 w-5" />
                            Kirjaudu
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;