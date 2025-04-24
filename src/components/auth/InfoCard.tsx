
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ChevronRight, Info } from 'lucide-react';

interface InfoCardProps {
  onBackToLogin: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({ onBackToLogin }) => {
  return (
    <Card className="backdrop-blur-xl bg-whatsapp-bubbleReceived/95 border-prescrevame/20 animate-slide-up">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Info className="h-5 w-5 text-prescrevame" /> 
          Sobre o PrescrevaMe
        </CardTitle>
        <CardDescription className="text-gray-300">
          Conheça nossa plataforma inovadora
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-gray-300">
        <div className="space-y-2">
          <h3 className="font-medium text-white flex items-center">
            <Heart className="h-4 w-4 text-prescrevame mr-2" /> Missão
          </h3>
          <p>
            Facilitar o trabalho dos profissionais de saúde através de uma plataforma 
            inteligente que auxilia na prescrição médica de forma precisa e eficiente.
          </p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-white flex items-center">
            <ChevronRight className="h-4 w-4 text-prescrevame mr-2" /> Recursos
          </h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>Prescrições médicas simplificadas</li>
            <li>Consulta rápida de medicamentos e dosagens</li>
            <li>Cálculos de dosagens automáticos</li>
            <li>Interface intuitiva estilo WhatsApp</li>
            <li>Suporte técnico especializado</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-white flex items-center">
            <ChevronRight className="h-4 w-4 text-prescrevame mr-2" /> Benefícios
          </h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>Economia de tempo no atendimento</li>
            <li>Redução de erros na prescrição</li>
            <li>Acesso rápido a informações essenciais</li>
            <li>Interface moderna e intuitiva</li>
            <li>Atualização constante da base de dados</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-2">
        <Button 
          variant="ghost"
          onClick={onBackToLogin}
          className="text-gray-300 hover:text-white hover:bg-white/5"
        >
          Voltar para login
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InfoCard;
