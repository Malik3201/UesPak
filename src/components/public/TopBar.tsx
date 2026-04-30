import Container from "@/components/shared/Container";
import { Phone, Mail, MapPin } from "lucide-react";

export default function TopBar() {
  return (
    <div className="hidden md:block bg-primary text-primary-foreground text-xs py-2">
      <Container className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="tel:+92XXXXXXXXXX"
            className="flex items-center gap-1.5 hover:text-primary-foreground/80 transition-colors"
          >
            <Phone className="h-3 w-3" aria-hidden="true" />
            +92 XXX XXXXXXX
          </a>
          <a
            href="mailto:services@uespak.com"
            className="flex items-center gap-1.5 hover:text-primary-foreground/80 transition-colors"
          >
            <Mail className="h-3 w-3" aria-hidden="true" />
            services@uespak.com
          </a>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          <span>Islamabad, Pakistan</span>
        </div>
      </Container>
    </div>
  );
}
