import {
  Wrench, CircleDot, Droplet, Disc, Activity, Snowflake, SprayCan, Sparkles,
  ClipboardCheck, PlugZap, Car, type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  wrench: Wrench,
  'circle-dot': CircleDot,
  droplet: Droplet,
  disc: Disc,
  activity: Activity,
  snowflake: Snowflake,
  'spray-can': SprayCan,
  sparkles: Sparkles,
  'clipboard-check': ClipboardCheck,
  'plug-zap': PlugZap,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = MAP[name] ?? Car;
  return <Icon className={className} aria-hidden />;
}
