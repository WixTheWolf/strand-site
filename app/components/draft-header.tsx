import AppHeader from "./app-header";

type DraftHeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  extraLink?: { href: string; label: string };
};

export default function DraftHeader({
  title,
  extraLink,
}: DraftHeaderProps) {
  return <AppHeader title={title} extraLink={extraLink} />;
}
