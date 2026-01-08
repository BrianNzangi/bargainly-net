import { PublicLayout, Footer } from "./components/public"
import {
  Featured,
  HomepageCollections,
  MoreFromBargainly
} from "./components/home"

export default function Home() {
  return (
    <PublicLayout>
      {/* Featured Articles Section */}
      <Featured />

      {/* Smart Homes Collection */}
      <HomepageCollections collection="smart-homes" title="Smart Homes" backgroundColor="white" />

      {/* Gaming Collection */}
      <HomepageCollections collection="gaming" title="Gaming" backgroundColor="white" />

      {/* Deals Collection */}
      <HomepageCollections collection="deals" title="Deals" backgroundColor="white" />

      {/* Tech Collection */}
      <HomepageCollections collection="tech" title="Tech" backgroundColor="white" />

      {/* Health Collection */}
      <HomepageCollections collection="health" title="Health" backgroundColor="white" />

      {/* More from Bargainly - List Format */}
      <MoreFromBargainly />

      {/* Footer */}
      <Footer />
    </PublicLayout>
  );
}
