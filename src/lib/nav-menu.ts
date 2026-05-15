export interface NavMenuItem {
  href: string;
  label: string;
}

export interface NavMenuGroup {
  title: string;
  viewAllHref: string;
  links: NavMenuItem[];
}

export function dedupeNavLinks(links: NavMenuItem[]): NavMenuItem[] {
  const seen = new Set<string>();
  return links.filter((item) => {
    const key = item.href.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
