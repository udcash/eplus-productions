import { useState } from 'react';
import { useRevealAll, useSmoothScroll } from './hooks.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Intro from './components/Intro.jsx';
import Clients from './components/Clients.jsx';
import Services from './components/Services.jsx';
import Work from './components/Work.jsx';
import Team from './components/Team.jsx';
import Faq from './components/Faq.jsx';
import Cta from './components/Cta.jsx';
import Footer from './components/Footer.jsx';
import ReelModal from './components/ReelModal.jsx';

export default function App() {
  const [reelOpen, setReelOpen] = useState(false);
  useSmoothScroll();
  useRevealAll();

  const openReel = () => setReelOpen(true);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header onReel={openReel} />
      <main id="main">
        <Hero onReel={openReel} />
        <Intro />
        <Clients />
        <Services />
        <Work onReel={openReel} />
        <Team />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <ReelModal open={reelOpen} onClose={() => setReelOpen(false)} />
    </>
  );
}
