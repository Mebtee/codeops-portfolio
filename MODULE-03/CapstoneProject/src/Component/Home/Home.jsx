import Hero from './Hero';
import BrandStory from './BrandStory';
import FeaturedDishes from './FeaturedDishes';
import ExperienceFeatures from './ExperienceFeatures';
import MembershipCTA from './MembershipCTA';
import ReservationCTA from './ReservationCTA';
import LocationSection from './LocationSection';
import './Home.css';

export default function Home() {
  return (
    <>
      <Hero />
      <BrandStory />
      <FeaturedDishes />
      <ExperienceFeatures />
      <MembershipCTA />
      <ReservationCTA />
      <LocationSection />
    </>
  );
}
