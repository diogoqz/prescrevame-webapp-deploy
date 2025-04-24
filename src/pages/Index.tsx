
import WhatsAppChat from '@/components/WhatsAppChat';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`bg-gradient-to-br from-whatsapp-bg to-slate-950 ${isMobile ? 'h-[100dvh] w-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* Decorative elements */}
      <div className="fixed top-20 left-10 w-40 h-40 rounded-full bg-prescrevame/5 blur-3xl"></div>
      <div className="fixed bottom-20 right-10 w-60 h-60 rounded-full bg-prescrevame/10 blur-3xl"></div>
      
      <WhatsAppChat />
    </div>
  );
};

export default Index;
