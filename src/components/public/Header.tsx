import TopBar from "./TopBar";
import Navbar from "./Navbar";
import type { PublicSiteSettings } from "@/types/site-settings";

export default function Header({
  settings,
}: {
  settings: PublicSiteSettings;
}) {
  return (
    <header>
      <TopBar settings={settings} />
      <Navbar settings={settings} />
    </header>
  );
}
