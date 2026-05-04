import Container from "@/components/shared/Container";
import type { PublicSiteSettings } from "@/types/site-settings";
import { CONTACT_EMAIL } from "@/lib/constants";
import { Phone, Mail, MapPin } from "lucide-react";

interface TopBarProps {
  settings: PublicSiteSettings;
}

export default function TopBar({ settings }: TopBarProps) {
  const phone = settings.primaryPhone?.trim();
  const email = settings.primaryEmail?.trim() || CONTACT_EMAIL;
  const addr = settings.address?.trim();

  return (
    <div className="hidden md:block bg-primary text-primary-foreground text-xs py-2">
      <Container className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-4">
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-1.5 hover:text-primary-foreground/80 transition-colors"
            >
              <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
              {phone}
            </a>
          ) : null}
          <a
            href={`mailto:${encodeURIComponent(email)}`}
            className="flex items-center gap-1.5 hover:text-primary-foreground/80 transition-colors"
          >
            <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
            {email}
          </a>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {addr || "Pakistan"}
          </span>
        </div>
      </Container>
    </div>
  );
}
