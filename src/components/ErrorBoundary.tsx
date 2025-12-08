// This file provides error handling components for the application.
// It uses the 'react-error-boundary' library to create a fallback UI when an error occurs.
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  sectionName: string;
}

// This component is displayed when an error occurs.
const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  // This function reloads the page.
  const handleReload = () => {
    window.location.reload();
  };
  // This function navigates to the home page.
  const handleGoHome = () => {
    window.location.href = '/';
  };
  // This function simulates reporting an error.
  // In a real application, you would send this to your error reporting service.
  const handleReportError = () => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('Error Report:', errorReport);
    
    // For now, just copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => alert('Virheraportti kopioitu leikepöydälle'))
      .catch(() => alert('Virheraportin kopiointi epäonnistui'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-900 mb-2">
            Oops! Jotain meni pieleen
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Pahoittelemme häiriötä. Sovelluksessa tapahtui odottamaton virhe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">Tekninen virhe:</h4>
            <p className="text-red-700 text-sm font-mono bg-red-100 p-2 rounded">
              {error.message}
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Mitä voit tehdä:</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <span>Yritä päivittää sivu</span>
              </li>
              <li className="flex items-center space-x-2">
                <Home className="w-4 h-4 text-blue-600" />
                <span>Palaa etusivulle</span>
              </li>
              <li className="flex items-center space-x-2">
                <Bug className="w-4 h-4 text-blue-600" />
                <span>Raportoi virhe tekniselle tuelle</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={resetErrorBoundary}
              variant="default"
              size="default"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Yritä uudelleen
            </Button>
            <Button 
              onClick={handleReload}
              variant="outline"
              size="default"
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Päivitä sivu
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleGoHome}
              variant="outline"
              size="default"
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Etusivulle
            </Button>
            <Button 
              onClick={handleReportError}
              variant="outline"
              size="default"
              className="flex-1"
            >
              <Bug className="w-4 h-4 mr-2" />
              Raportoi virhe
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Jos ongelma jatkuu, ota yhteyttä tekniseen tukeen.</p>
            <p className="mt-1">Pirkanmaan hyvinvointialue</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// This is a generic error boundary component that can be used to wrap any part of the application.
const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  // This function is called when an error is caught by the error boundary.
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In a real application, you would send this to your error reporting service
    // Example: Sentry, LogRocket, or custom error reporting
    const errorData = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('pirha_session_id') || 'anonymous'
    };
    
    // Store error locally for potential reporting
    try {
      const existingErrors = JSON.parse(localStorage.getItem('pirha_errors') || '[]');
      existingErrors.push(errorData);
      
      // Keep only last 10 errors to avoid storage overflow
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('pirha_errors', JSON.stringify(recentErrors));
    } catch (storageError) {
      console.error('Failed to store error data:', storageError);
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Clear any error state and redirect to home
        window.location.href = '/';
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

// This hook can be used to manually report errors.
export const useErrorReporting = () => {
  // This function reports an error.
  const reportError = (error: Error | string, context: Record<string, any> = {}) => {
    try {
      const errorData = {
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack || 'No stack trace' : 'No stack trace',
          name: error instanceof Error ? error.name || 'Unknown Error' : 'Unknown Error'
        },
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('pirha_session_id') || 'anonymous'
      };
      
      console.error('Manual error report:', errorData);
      
      // Store error locally
      const existingErrors = JSON.parse(localStorage.getItem('pirha_errors') || '[]');
      existingErrors.push(errorData);
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('pirha_errors', JSON.stringify(recentErrors));
      
      return { success: true };
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
      return { success: false, error: reportingError instanceof Error ? reportingError.message : String(reportingError) };
    }
  };
  // This function returns all the stored errors.
  const getStoredErrors = () => {
    try {
      return JSON.parse(localStorage.getItem('pirha_errors') || '[]');
    } catch (error) {
      console.error('Failed to get stored errors:', error);
      return [];
    }
  };
  // This function clears all the stored errors.
  const clearStoredErrors = () => {
    try {
      localStorage.removeItem('pirha_errors');
      return { success: true };
    } catch (error) {
      console.error('Failed to clear stored errors:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

  return {
    reportError,
    getStoredErrors,
    clearStoredErrors
  };
};

// This component is an error boundary for a specific section of the application.
export const SectionErrorBoundary = ({ children, sectionName }: SectionErrorBoundaryProps) => {
  // This component is displayed when an error occurs in a section.
  const SectionErrorFallback = ({ resetErrorBoundary }: FallbackProps) => (
    <Card className="m-4">
      <CardHeader className="">
        <CardTitle className="text-red-900 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Virhe osiossa: {sectionName}
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        <p className="text-gray-600 mb-4">
          Tässä osiossa tapahtui virhe. Voit yrittää uudelleen tai siirtyä toiseen osioon.
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={resetErrorBoundary}
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Yritä uudelleen
          </Button>
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            size="sm"
            className=""
          >
            Takaisin
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ReactErrorBoundary
      FallbackComponent={SectionErrorFallback}
      onError={(error: Error, errorInfo: React.ErrorInfo) => {
        console.error(`Error in section ${sectionName}:`, error, errorInfo);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;