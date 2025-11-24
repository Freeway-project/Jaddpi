'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressSuggestion {
  description: string;
  place_id: string;
  main_text: string;
  secondary_text: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}


// Simple debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Enter your Canadian address",
  label = "",
  error,
  disabled = false,
  className = "",
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const debouncedValue = useDebounce(value, 300);

  // Wait for Google Maps API to be loaded (loaded globally by LoadScript)
  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (typeof window !== 'undefined' && window.google?.maps?.places) {
        setApiError(null);
      } else {
        // Retry after a short delay
        setTimeout(checkGoogleMapsLoaded, 100);
      }
    };
    checkGoogleMapsLoaded();
  }, []);

  // Google Places API call - restricted to Canada (using new AutocompleteSuggestion API)
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Check if Google Maps API is available
      if (typeof window !== 'undefined' && window.google?.maps?.places) {
        const { AutocompleteSuggestion } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;

        const request: google.maps.places.AutocompleteRequest = {
          input: input,
          includedRegionCodes: ['ca'], // Canada only
        };

        const { suggestions: predictions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

        if (predictions && predictions.length > 0) {
          const canadianSuggestions = predictions
            .map(prediction => {
              const placePrediction = prediction.placePrediction;
              if (!placePrediction) return null;

              return {
                description: placePrediction.text?.text || '',
                place_id: placePrediction.placeId || '',
                main_text: placePrediction.mainText?.text || '',
                secondary_text: placePrediction.secondaryText?.text || ''
              };
            })
            .filter((s): s is AddressSuggestion => s !== null && s.description !== '');

          setSuggestions(canadianSuggestions);
        } else {
          setSuggestions([]);
        }
        setIsLoading(false);
      } else {
        // Show error message if Google Maps API is not available
        console.error('Google Maps API is not loaded. Please check your API key.');
        setApiError('Address autocomplete is not available. Please type your address manually.');
        setSuggestions([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedValue.trim() && showSuggestions) {
      fetchSuggestions(debouncedValue);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [debouncedValue, showSuggestions, fetchSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    if (inputValue.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    onChange(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    setIsLoading(false);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSuggestions([]);
      setIsLoading(false);
    }, 200);
  };

  const handleInputFocus = () => {
    if (value.trim().length >= 3 && suggestions.length === 0) {
      fetchSuggestions(value);
    }
    if (value.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      {label && (
        <Label htmlFor="address" className="text-sm font-medium text-slate-700 ml-1 mb-2 block">{label}</Label>
      )}


      <div className="relative group">
        <Input
          id="address"
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`h-14 pl-4 rounded-2xl border-slate-200 bg-slate-50 text-lg transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${className}`}
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          ) : (
            <MapPin className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm font-medium text-rose-500 mt-1.5 flex items-center gap-1.5 animate-in slide-in-from-top-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
          {error}
        </p>
      )}

      {apiError && !error && (
        <p className="text-sm text-amber-600 mt-1.5">{apiError}</p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto overflow-hidden">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion.place_id}
              variant="ghost"
              className="w-full justify-start h-auto px-4 py-3 text-left rounded-none hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start space-x-3 w-full">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900">
                    {suggestion.main_text}
                  </div>
                  <div className="text-sm text-slate-500 truncate mt-0.5">
                    {suggestion.secondary_text}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}