
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      toast({
        title: "Instale o PrescrevaMe",
        description: "Baixe nosso app para ter acesso rápido e offline às funcionalidades! 🚀",
        action: (
          <button
            onClick={() => handleInstallClick()}
            className="bg-prescrevame hover:bg-prescrevame-dark text-black font-medium px-4 py-1 rounded-md transition-colors"
          >
            Instalar
          </button>
        ),
        duration: 10000,
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast({
        title: "Obrigado por instalar! 🎉",
        description: "Agora você tem acesso rápido ao PrescrevaMe direto do seu dispositivo.",
      });
    }
    
    setDeferredPrompt(null);
  };

  return { handleInstallClick, canInstall: !!deferredPrompt };
};
