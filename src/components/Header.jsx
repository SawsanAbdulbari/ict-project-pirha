// This component is the main header for the application.
// It displays the language switcher and login/logout buttons.
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, LogIn } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
// The Header component receives the user object, a logout function, and a navigation function as props.
const Header = ({ user, onLogout, navigateTo }) => {
    // This hook is used for internationalization.
    const { t } = useTranslation();
    return (
        <header className="bg-white shadow-md p-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* This component allows the user to switch the language of the application. */}
                <LanguageSwitcher />
                <div className="flex items-center gap-4">
                    {/* If the user is logged in, show the profile and logout buttons. */}
                    {user ? (
                        <>
                            <Button
                                onClick={() => navigateTo('profile')}
                                variant="ghost"
                                size="sm"
                            >
                                <User className="w-4 h-4 mr-2" />
                                {t('profile')}
                            </Button>
                            <Button
                                onClick={onLogout}
                                variant="destructive"
                                size="sm"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                {t('logout')}
                            </Button>
                        </>
                    ) : (
                        // If the user is not logged in, show the login button.
                        <Button
                            onClick={() => navigateTo('login')}
                            variant="outline"
                            size="sm"
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            {t('login')}
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
