'use client';

import { useState, useEffect } from 'react';
import { Package, ArrowRight, Locate, MapPinned } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import AddressAutocomplete from '../auth/AddressAutocomplete';
import { deliveryAPI, FareEstimateResponse } from '../../lib/api/delivery';
import { useSearchStore } from '../../lib/stores/searchStore';
import { FareEstimateModal } from '../booking/FareEstimateModal';
import toast from 'react-hot-toast';

interface Location {
  lat: number;
  lng: number;
}

interface FromToSearchProps {
  onEstimate?: (estimate: FareEstimateResponse, additionalData?: {
    pickupAddress: string;
    dropoffAddress: string;
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    packageSize: string;
  }) => void;
  showPackageDetails?: boolean;
  className?: string;
  prefillFromLastSearch?: boolean;
  onAddressChange?: (pickup: string, dropoff: string, pickupCoords?: Location, dropoffCoords?: Location) => void;
}

interface PackageDetails {
  type: 'envelope' | 'small' | 'medium' | 'large';
  weight?: string;
  description?: string;
}

const packageSizeMap = {
  'envelope': 'XS',
  'small': 'S',
  'medium': 'M',
  'large': 'L'
} as const;

export default function FromToSearch({
  onEstimate,
  showPackageDetails = false,
  className = '',
  prefillFromLastSearch = false,
  onAddressChange
}: FromToSearchProps) {
  const { addSearch, getLastSearch } = useSearchStore();
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    type: 'small'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [currentEstimate, setCurrentEstimate] = useState<{
    estimate: FareEstimateResponse,
    details: {
      pickupAddress: string;
      dropoffAddress: string;
      pickupLat: number;
      pickupLng: number;
      dropoffLat: number;
      dropoffLng: number;
      packageSize: string;
    }
  } | null>(null);

  // Prefill from last search if enabled (excluding dropoff)
  useEffect(() => {
    if (prefillFromLastSearch) {
      const lastSearch = getLastSearch();
      if (lastSearch) {
        setFromAddress(lastSearch.fromAddress);
        // Keep dropoff blank for new search
        setPackageDetails({
          type: lastSearch.packageType,
          description: lastSearch.packageDescription
        });
      }
    }
  }, [prefillFromLastSearch, getLastSearch]);

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number; formattedAddress: string }> => {
    if (!window.google?.maps) {
      throw new Error('Google Maps not loaded');
    }

    const geocoder = new window.google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formattedAddress: results[0].formatted_address
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  };

  const handleSearch = async () => {
    if (!fromAddress || !toAddress) {
      toast.error('Please enter both pickup and dropoff addresses');
      return;
    }

    setIsLoading(true);

    try {
      const pickupResult = await geocodeAddress(fromAddress);
      const dropoffResult = await geocodeAddress(toAddress);

      const packageSize = packageSizeMap[packageDetails.type];

      const estimate = await deliveryAPI.getFareEstimate({
        pickup: pickupResult,
        dropoff: dropoffResult,
        packageSize,
      });

      if (!estimate?.data?.fare) {
        throw new Error('Invalid response from server');
      }

      // Use the formatted address from geocoder to ensure we have the most detailed address
      // But keep the user's input if they manually typed something specific that geocoder might have altered too much
      // Actually, for "most detailed", formatted_address is usually better (includes postal code, province, country)
      const finalPickupAddress = pickupResult.formattedAddress || fromAddress;
      const finalDropoffAddress = dropoffResult.formattedAddress || toAddress;

      // Save search to local storage
      addSearch({
        fromAddress: finalPickupAddress,
        toAddress: finalDropoffAddress,
        fromCoords: pickupResult,
        toCoords: dropoffResult,
        packageType: packageDetails.type,
        packageDescription: packageDetails.description,
        estimatedFare: estimate?.data?.fare?.total
      });

      // Store the current estimate and show modal
      const estimateDetails = {
        pickupAddress: finalPickupAddress,
        dropoffAddress: finalDropoffAddress,
        pickupLat: pickupResult.lat,
        pickupLng: pickupResult.lng,
        dropoffLat: dropoffResult.lat,
        dropoffLng: dropoffResult.lng,
        packageSize: packageSize,
      };

      setCurrentEstimate({
        estimate,
        details: estimateDetails
      });

      // Pass addresses and coordinates to parent component
      onAddressChange?.(finalPickupAddress, finalDropoffAddress, pickupResult, dropoffResult);

      // Show modal first (user sees fare estimate)
      setShowEstimateModal(true);
    } catch (err: any) {
      console.error('Fare estimate error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to get estimate. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const packageTypes = [
    { id: 'envelope', label: 'Envelope', icon: '📄', size: '8.5x11 ' },
    { id: 'small', label: 'Small', icon: '📦', size: '10×10×10 ' },
    { id: 'medium', label: 'Medium', icon: '📦', size: '14×14×14 ' },
    { id: 'large', label: 'Large', icon: '📦', size: '16×16×16 ' },
  ];

  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-500 ${className}`}>
      {/* Scrollable Content */}
      <div className="p-3 sm:p-6 space-y-3 sm:space-y-4 pb-3 sm:pb-6">
        {/* Address Selection */}
        <div className="space-y-3 sm:space-y-5">
          {/* Pickup Address */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100">
                <Locate className="w-3.5 h-3.5 text-green-600" />
              </div>
              <Label className="text-xs sm:text-base font-semibold text-gray-900">Pickup Location</Label>
            </div>
            <AddressAutocomplete
              value={fromAddress}
              onChange={setFromAddress}
              label=''
              placeholder="Enter pickup address"
              className="h-11 sm:h-14 text-sm sm:text-lg rounded-xl"

            />
          </div>

          {/* Arrow Indicator */}
          <div className="flex justify-center -my-1.5 sm:-my-1">
            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100">
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 rotate-90" />
            </div>
          </div>

          {/* Dropoff Address */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100">
                <MapPinned className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <Label className="text-xs sm:text-base font-semibold text-gray-900">Dropoff Location</Label>
            </div>
            <AddressAutocomplete
              value={toAddress}
              label=''
              onChange={setToAddress}
              placeholder="Enter dropoff address"
              className="h-11 sm:h-14 text-sm sm:text-lg rounded-xl"

            />
          </div>
        </div>

        {/* Package Details */}
        {showPackageDetails && (
          <div className="space-y-2 sm:space-y-4">
            {/* Package Type Selection */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100">
                  <Package className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <Label className="text-sm sm:text-base font-semibold text-gray-900">Package Size</Label>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {packageTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPackageDetails({ ...packageDetails, type: type.id as PackageDetails['type'] })}
                    className={`flex flex-col items-center justify-center text-center p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 h-24 sm:h-28 ${packageDetails.type === type.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                      : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-blue-400'
                      }`}
                  >
                    <span className="text-2xl sm:text-3xl">{type.icon}</span>
                    <div className="font-bold text-xs sm:text-sm mt-2">{type.label}</div>
                    <div className={`text-[10px] sm:text-xs mt-1 font-medium ${packageDetails.type === type.id ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                      {type.size}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-gray-500 mt-3">*Max weight for packages is 15kg. Envelopes up to 5kg</p>
            </div>

            {/* Description */}
            {/* <div>
            <Label htmlFor="description" className="text-sm sm:text-base font-semibold text-gray-900 mb-3 block">
              Package Description <span className="text-gray-400 font-normal text-sm">(Optional)</span>
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="What are you sending?"
              value={packageDetails.description || ''}
              onChange={(e) => setPackageDetails({ ...packageDetails, description: e.target.value })}
              className="h-12 sm:h-14 text-base sm:text-lg rounded-xl border-2 border-gray-200 focus:border-blue-600"
            />
          </div> */}
          </div>
        )}
      </div>

      {/* Search Button - Mobile */}
      <div className="sm:hidden px-3 pb-3">
        <Button
          onClick={handleSearch}
          disabled={!fromAddress || !toAddress || isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold h-12 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Getting estimate...</span>
            </div>
          ) : (
            <span>Get Price Estimate</span>
          )}
        </Button>
      </div>

      {/* Search Button - Desktop */}
      <div className="hidden sm:block px-6 pb-6">
        <Button
          onClick={handleSearch}
          disabled={!fromAddress || !toAddress || isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold h-14 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Getting estimate...</span>
            </div>
          ) : (
            <span>Get Price Estimate</span>
          )}
        </Button>
      </div>

      {/* Fare Estimate Modal */}
      {currentEstimate && (
        <FareEstimateModal
          isOpen={showEstimateModal}
          onClose={() => setShowEstimateModal(false)}
          pickup={currentEstimate.details.pickupAddress}
          dropoff={currentEstimate.details.dropoffAddress}
          estimatedFare={{
            total: currentEstimate.estimate.data.fare.total,
            distance: currentEstimate.estimate.data.fare.distanceKm,
            duration: currentEstimate.estimate.data.fare.durationMinutes,
            currency: 'CAD'
          }}
          onProceedToBooking={() => {
            // User is logged in and wants to proceed - now trigger parent callback
            onEstimate?.(currentEstimate.estimate, currentEstimate.details);
          }}
        />
      )}
    </div>
  );
}