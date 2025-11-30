import { useState, useEffect, useRef } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { userAPI, UserData } from '../../../lib/api/user';
import { useDebounce } from '../../../hooks/useDebounce';
import AddressAutocomplete from '../../auth/AddressAutocomplete';

export interface UserDetails {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

interface UserInfoFormProps {
  type: 'sender' | 'recipient';
  icon: LucideIcon;
  title: string;
  userDetails: UserDetails;
  onUpdate: (details: UserDetails) => void;
  addressEditable?: boolean;
}

export default function UserInfoForm({
  type,
  icon: Icon,
  title,
  userDetails,
  onUpdate,
  addressEditable = true
}: UserInfoFormProps) {
  const [uuid, setUuid] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<UserData | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Refs for keyboard navigation
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const debouncedUuid = useDebounce(uuid, 500);

  // Auto-focus first input when component mounts
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Fetch user suggestion when UUID is entered (debounced)
  useEffect(() => {
    const fetchUserSuggestion = async () => {
      if (debouncedUuid.trim().length < 3) {
        setSuggestion(null);
        setShowSuggestion(false);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const userData = await userAPI.getUserByUuid(debouncedUuid);
        setSuggestion(userData);
        setShowSuggestion(true);
      } catch (error: any) {
        setSuggestion(null);
        setShowSuggestion(false);
        setSearchError('User not found with this ID');
      } finally {
        setIsSearching(false);
      }
    };

    fetchUserSuggestion();
  }, [debouncedUuid]);

  const handleSelectSuggestion = (userData: UserData) => {
    onUpdate({
      name: userData.profile?.name || '',
      phone: userData.auth?.phone || userData.phone || '',
      address: userData.profile?.address || userDetails.address || '',
      notes: userDetails.notes
    });
    setShowSuggestion(false);
    setSearchError(null);

    // Focus on name input after selection
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  // Handle keyboard navigation for suggestion
  const handleUuidKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && suggestion && showSuggestion) {
      e.preventDefault();
      handleSelectSuggestion(suggestion);
    } else if (e.key === 'Escape') {
      setShowSuggestion(false);
    }
  };

  return (
    <div
      className="space-y-2 animate-slide-in-up"
      role="region"
      aria-label={`${title} form section`}
    >
      <div className="flex items-center space-x-2 pb-1">
        <div
          className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <Icon className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-2">
        {/* UUID Quick Fill */}
        <div className="relative">
          <Label
            htmlFor={`${type}-uuid`}
            className="text-xs font-semibold text-gray-900 mb-1 block"
          >
            Quick Fill (Optional)
          </Label>
          <Input
            id={`${type}-uuid`}
            type="text"
            placeholder={`Enter ${type} ID (e.g., JAD12345)`}
            value={uuid}
            onChange={(e) => setUuid(e.target.value)}
            onFocus={() => suggestion && setShowSuggestion(true)}
            onBlur={() => setTimeout(() => setShowSuggestion(false), 200)}
            onKeyDown={handleUuidKeyDown}
            className="h-10 text-sm border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            aria-describedby={searchError ? `${type}-uuid-error` : undefined}
            aria-invalid={!!searchError}
          />
          {isSearching && (
            <Loader2
              className="w-3.5 h-3.5 animate-spin text-gray-400 absolute right-3 top-7"
              aria-label="Searching for user"
            />
          )}

          {/* Suggestion */}
          {showSuggestion && suggestion && (
            <div
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg animate-fade-in"
              role="listbox"
              aria-label="User suggestions"
            >
              <button
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full p-2 text-left hover:bg-gray-50 transition-colors rounded-lg focus:bg-gray-50"
                role="option"
                aria-selected="true"
              >
                <div className="font-medium text-sm text-gray-900">{suggestion.profile?.name}</div>
                <div className="text-xs text-gray-600 mt-0.5">{suggestion.auth?.phone || suggestion.phone}</div>
              </button>
            </div>
          )}

          {/* Error message with live region */}
          {searchError && (
            <p
              id={`${type}-uuid-error`}
              className="text-xs text-red-600 mt-1 animate-fade-in"
              role="alert"
              aria-live="polite"
            >
              {searchError}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {/* Name */}
          <div>
            <Label
              htmlFor={`${type}-name`}
              className="text-sm font-semibold text-gray-900 mb-1 block"
            >
              Full Name <span className="text-red-500" aria-label="required">*</span>
            </Label>
            <Input
              ref={nameInputRef}
              id={`${type}-name`}
              type="text"
              placeholder={`Enter ${type}'s full name`}
              value={userDetails.name}
              onChange={(e) => onUpdate({ ...userDetails, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  phoneInputRef.current?.focus();
                }
              }}
              className="h-11 text-base border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              required
              aria-required="true"
              autoComplete="name"
            />
          </div>

          {/* Phone */}
          <div>
            <Label
              htmlFor={`${type}-phone`}
              className="text-sm font-semibold text-gray-900 mb-1 block"
            >
              Phone Number <span className="text-red-500" aria-label="required">*</span>
            </Label>
            <Input
              ref={phoneInputRef}
              id={`${type}-phone`}
              type="tel"
              inputMode="numeric"
              pattern="\d*"
              maxLength={10}
              placeholder="e.g. 6041234567"
              value={userDetails.phone}
              onChange={(e) => {
                // allow only digits (strip all non-digit characters)
                const digits = e.target.value.replace(/\D/g, '');
                // limit to 10 digits
                const limited = digits.slice(0, 10);
                onUpdate({ ...userDetails, phone: limited });
                // clear error while typing
                if (phoneError) setPhoneError(null);
              }}
              onBlur={() => {
                // validation: require exactly 10 digits
                const len = (userDetails.phone || '').replace(/\D/g, '').length;
                if (len > 0 && len < 10) {
                  setPhoneError('Please enter a valid 10-digit phone number');
                } else {
                  setPhoneError(null);
                }
              }}
              className="h-11 text-base border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              required
              aria-required="true"
              aria-invalid={!!phoneError}
              aria-describedby={phoneError ? `${type}-phone-error` : undefined}
              autoComplete="tel"
            />
            {phoneError && (
              <p
                id={`${type}-phone-error`}
                className="text-sm font-medium text-red-600 mt-1 animate-fade-in"
                role="alert"
                aria-live="polite"
              >
                {phoneError}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            {addressEditable ? (
              <AddressAutocomplete
                label={`${type === 'sender' ? 'Pickup Address' : 'Delivery Address'} *`}
                placeholder={type === 'sender' ? 'Enter pickup address' : 'Enter delivery address'}
                value={userDetails.address}
                onChange={(value) => onUpdate({ ...userDetails, address: value })}
                className="h-11 text-base border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            ) : (
              <>
                <Label
                  htmlFor={`${type}-address`}
                  className="text-sm font-semibold text-gray-900 mb-1 block"
                >
                  {type === 'sender' ? 'Pickup Address' : 'Delivery Address'} <span className="text-red-500" aria-label="required">*</span>
                </Label>
                <div
                  id={`${type}-address`}
                  className="px-3 py-3 bg-gray-100 border border-gray-300 rounded-lg text-base text-gray-900 break-words font-medium"
                  role="textbox"
                  aria-readonly="true"
                  aria-label={`${type === 'sender' ? 'Pickup' : 'Delivery'} address: ${userDetails.address}`}
                >
                  {userDetails.address}
                </div>
              </>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label
              htmlFor={`${type}-notes`}
              className="text-sm font-semibold text-gray-900 mb-1 block"
            >
              {type === 'sender' ? 'Pickup Instructions' : 'Delivery Instructions'} (Optional)
            </Label>
            <Input
              id={`${type}-notes`}
              type="text"
              placeholder={
                type === 'sender'
                  ? 'e.g., Ring doorbell, Gate code: 1234'
                  : 'e.g., Buzzer code , parking inst, dogs'
              }
              value={userDetails.notes}
              onChange={(e) => onUpdate({ ...userDetails, notes: e.target.value })}
              className="h-11 text-base border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              aria-describedby={`${type}-notes-hint`}
            />
            <p
              id={`${type}-notes-hint`}
              className="text-xs text-gray-500 mt-1 sr-only"
            >
              Optional delivery or pickup instructions for the driver
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
