import {
  PotIcon,
  HeartIcon,
  LeafIcon,
  GatherIcon,
} from '../UI/icons';

const FEATURES = [
  {
    Icon: PotIcon,
    title: 'Authentic Ethiopian Cuisine',
    body: 'Traditional recipes and flavors prepared with care.',
  },
  {
    Icon: HeartIcon,
    title: 'Warm Hospitality',
    body: 'Experience the generosity and connection at the heart of Ethiopian culture.',
  },
  {
    Icon: LeafIcon,
    title: 'Fresh Ingredients',
    body: 'Quality ingredients prepared fresh for every gathering.',
  },
  {
    Icon: GatherIcon,
    title: 'Memorable Gatherings',
    body: 'A place to share food, stories, and meaningful moments.',
  },
];

export default function ExperienceFeatures() {
  return (
    <section className="experience" aria-labelledby="experience-title">
      <div className="section-inner">
        <header className="section-head center">
          <p className="section-kicker">The Experience</p>
          <h2 id="experience-title" className="section-title">
            Made for Sharing
          </h2>
        </header>

        <ul className="feature-grid">
          {FEATURES.map(({ Icon, title, body }) => (
            <li key={title} className="feature-card">
              <span className="feature-icon">
                <Icon size={26} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
