import React from 'react';
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WebhookLog {
  _id: string;
  eventId: string;
  eventType: string;
  eventData: any;
  receivedAt: string;
  processed: boolean;
}

interface LogsTabProps {
  logs: WebhookLog[];
  loading: boolean;
  onRefresh: () => void;
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs, loading, onRefresh }) => {
  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'payment_intent.created':
        return 'bg-blue-100 text-blue-800';
      case 'payment_intent.succeeded':
        return 'bg-green-100 text-green-800';
      case 'payment_intent.payment_failed':
        return 'bg-red-100 text-red-800';
      case 'payment_intent.processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatEventData = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return 'Invalid JSON data';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Webhook Logs</h2>
          <p className="text-gray-600">Monitor Stripe webhook events and their processing status</p>
        </div>
        <Button onClick={onRefresh} size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No webhook logs found</h3>
          <p className="text-gray-600">Webhook events will appear here when received from Stripe</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Intent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {log.eventId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getEventTypeColor(log.eventType)}>
                        {log.eventType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        {new Date(log.receivedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {log.processed ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        <span className={`text-sm ${log.processed ? 'text-green-600' : 'text-red-600'}`}>
                          {log.processed ? 'Processed' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.eventData?.object?.id ? (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {log.eventData.object.id}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};