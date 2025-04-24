
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <Card className="bg-whatsapp-bubbleReceived/95 border-none">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Icon className="h-5 w-5 text-prescrevame" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default InfoCard;
