import { AnimatedBackground } from '@/components/AnimatedBackground';
import { ArtworkGallery } from '@/components/ArtworkGallery';
import { FaqSection } from '@/components/FaqSection';
import { FloatingCta } from '@/components/FloatingCta';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Navbar } from '@/components/Navbar';
import { OrderModal } from '@/components/OrderModal';
import { OrderWizard } from '@/components/OrderWizard';
import { PricingSection } from '@/components/PricingSection';
import { ProcessTimeline } from '@/components/ProcessTimeline';
import { SocialCards } from '@/components/SocialCards';
import { TermsSection } from '@/components/TermsSection';

export default function Page() {
  return <main>
    <AnimatedBackground />
    <Navbar />
    <Hero />
    <TermsSection />
    <PricingSection />
    <ArtworkGallery />
    <ProcessTimeline />
    <FaqSection />
    <OrderWizard />
    <SocialCards />
    <Footer />
    <FloatingCta />
    <OrderModal />
    <script dangerouslySetInnerHTML={{ __html: `if(location.hash==='#termsofservice')location.hash='#terms';if(location.hash==='#form')location.hash='#order';if(location.hash==='#pricelist')location.hash='#pricing';` }} />
  </main>;
}
