import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail, Phone } from 'lucide-react';

const Blocked = () => {
  const handleSupport = () => {
    window.open('https://api.whatsapp.com/send?phone=556392437559&text=SUPORTE%20-%20Conta%20Bloqueada', '_blank');
  };

  const handleEmail = () => {
    window.open('mailto:suporte@prescrevame.com?subject=Conta%20Bloqueada', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Conta Bloqueada
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sua conta foi bloqueada por violação dos termos de uso ou por motivos de segurança.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            <p>Se você acredita que isso foi um erro, entre em contato conosco:</p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleSupport}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Phone className="mr-2 h-4 w-4" />
              Suporte via WhatsApp
            </Button>
            
            <Button 
              onClick={handleEmail}
              variant="outline"
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Enviar Email
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>Horário de atendimento: Segunda a Sexta, 8h às 18h</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Blocked; 