
import WhatsAppChat from '@/components/WhatsAppChat';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`bg-slate-900 ${isMobile ? 'h-[100dvh] w-screen overflow-hidden' : 'min-h-screen'}`}>
      <WhatsAppChat />
    </div>
  );
};

export default Index;
