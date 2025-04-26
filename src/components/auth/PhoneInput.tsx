
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
}

// Lista de países com códigos telefônicos
const countries = [
  { code: 'br', name: 'Brasil', prefix: '+55' },
  { code: 'us', name: 'Estados Unidos', prefix: '+1' },
  { code: 'pt', name: 'Portugal', prefix: '+351' },
  { code: 'es', name: 'Espanha', prefix: '+34' },
  { code: 'fr', name: 'França', prefix: '+33' },
  // Adicione mais países conforme necessário
];

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  id = 'phone',
  className = '',
  disabled = false,
}) => {
  const [selectedCountry, setSelectedCountry] = useState('br');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Função para aplicar máscara ao número de telefone brasileiro
  const applyMask = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara com base no país selecionado
    if (selectedCountry === 'br') {
      // Máscara para Brasil: (99) 99999-9999
      if (numbers.length <= 2) {
        return `(${numbers}`;
      } else if (numbers.length <= 6) {
        return `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
      } else if (numbers.length <= 10) {
        return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
      } else {
        return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`;
      }
    } else {
      // Para outros países, apenas agrupe os números
      if (numbers.length <= 3) {
        return numbers;
      } else if (numbers.length <= 7) {
        return `${numbers.substring(0, 3)}-${numbers.substring(3)}`;
      } else {
        return `${numbers.substring(0, 3)}-${numbers.substring(3, 7)}-${numbers.substring(7)}`;
      }
    }
  };

  // Atualiza o valor completo do telefone quando o país ou número mudam
  useEffect(() => {
    const country = countries.find(c => c.code === selectedCountry);
    const prefix = country?.prefix || '';
    onChange(`${prefix}${phoneNumber.replace(/\D/g, '')}`);
  }, [selectedCountry, phoneNumber, onChange]);

  // Extrair apenas os números do valor inicial
  useEffect(() => {
    if (value) {
      // Tenta encontrar o código do país no valor fornecido
      const country = countries.find(c => value.startsWith(c.prefix));
      if (country) {
        setSelectedCountry(country.code);
        // Remove o prefixo do país do número
        const numberWithoutPrefix = value.substring(country.prefix.length);
        setPhoneNumber(applyMask(numberWithoutPrefix));
      } else {
        // Se não encontrar, assume que é apenas o número
        setPhoneNumber(applyMask(value));
      }
    }
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyMask(e.target.value);
    setPhoneNumber(maskedValue);
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-300">Telefone</Label>
      <div className="flex space-x-2">
        <div className="w-1/3">
          <Select
            value={selectedCountry}
            onValueChange={handleCountryChange}
            disabled={disabled}
          >
            <SelectTrigger className="bg-whatsapp-inputBg border-none text-white">
              <SelectValue placeholder="País" />
            </SelectTrigger>
            <SelectContent className="bg-whatsapp-bubbleReceived border-none">
              {countries.map((country) => (
                <SelectItem 
                  key={country.code} 
                  value={country.code}
                  className="text-white hover:bg-whatsapp-inputBg"
                >
                  {country.name} ({country.prefix})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-2/3">
          <Input
            id={id}
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            className={`bg-whatsapp-inputBg border-none text-white placeholder:text-gray-400 ${className}`}
            placeholder={selectedCountry === 'br' ? '(99) 99999-9999' : '999-999-9999'}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default PhoneInput;
