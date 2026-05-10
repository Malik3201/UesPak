import Navbar from "./Navbar";
import type { PublicSiteSettings } from "@/types/site-settings";

export default function Header({
  settings,
}: {
  settings: PublicSiteSettings;
}) {
  return (
    <header>
      <Navbar settings={settings} />
      <div className="h-16 md:h-[7.25rem]" aria-hidden="true" />
    </header>
  );
}
