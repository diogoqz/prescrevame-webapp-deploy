
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { toast } = useToast();

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast({
        title: "✨ Instalação concluída!",
        description: "O PrescrevaMe agora está disponível no seu dispositivo.",
        className: "bg-gradient-to-r from-prescrevame to-prescrevame-dark text-black font-medium",
        duration: 5000,
      });
    }
    
    setDeferredPrompt(null);
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      toast({
        title: "💫 Instale o PrescrevaMe",
        description: "Tenha acesso rápido ao seu assistente médico!",
        action: (
          <Button
            onClick={handleInstallClick}
            className="bg-black/10 hover:bg-black/20 text-black font-medium px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2"
          >
            <Download size={18} />
            Instalar App
          </Button>
        ),
        className: "bg-gradient-to-r from-prescrevame to-prescrevame-dark text-black border-none",
        duration: 0, // Never auto-dismiss
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      console.log('Aplicativo já está instalado');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, [toast]);

  return { handleInstallClick, canInstall: !!deferredPrompt };
};
