import { Skeleton } from '@workspace/ui/components/skeleton';

export default function FormSkeleton() {
    return (
        <div className="space-y-6" role="status" aria-label="Loading form">
            {/* Header */}
            <div className="flex items-center space-x-2">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-5 w-32" />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
                {/* Quick Fill */}
                <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                </div>

                {/* Name Field */}
                <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-11 w-full rounded-lg" />
                </div>

                {/* Phone Field */}
                <div>
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-11 w-full rounded-lg" />
                </div>

                {/* Address Field */}
                <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-11 w-full rounded-lg" />
                </div>

                {/* Notes Field */}
                <div>
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-11 w-full rounded-lg" />
                </div>
            </div>

            <span className="sr-only">Loading form data...</span>
        </div>
    );
}
