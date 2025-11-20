'use client';

import { Clock } from 'lucide-react';

interface OfflineMessageProps {
  message?: string;
  businessHours?: {
    [key: string]: { start: string; end: string };
  };
}

export function OfflineMessage({ 
  message = 'No momento estamos offline. Deixe seus dados que entraremos em contato!',
  businessHours 
}: OfflineMessageProps) {
  const getDayName = (day: string) => {
    const days: { [key: string]: string } = {
      monday: 'Segunda',
      tuesday: 'Terça',
      wednesday: 'Quarta',
      thursday: 'Quinta',
      friday: 'Sexta',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };
    return days[day] || day;
  };

  const formatTime = (time: string) => {
    if (time === '00:00') return 'Fechado';
    return time;
  };

  return (
    <div className="p-6 text-center">
      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      
      <h3 className="text-lg font-semibold mb-2">Estamos offline</h3>
      
      <p className="text-gray-600 mb-6">{message}</p>
      
      {businessHours && (
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <h4 className="text-sm font-semibold mb-2">Horário de atendimento:</h4>
          <div className="space-y-1 text-sm">
            {Object.entries(businessHours).map(([day, hours]) => (
              <div key={day} className="flex justify-between">
                <span className="text-gray-600">{getDayName(day)}:</span>
                <span className="font-medium">
                  {hours.start === '00:00' && hours.end === '00:00' 
                    ? 'Fechado' 
                    : `${formatTime(hours.start)} - ${formatTime(hours.end)}`
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}