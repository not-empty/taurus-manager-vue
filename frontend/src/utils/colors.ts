type HealthColor = 'dark' | 'purple' | 'red' | 'yellow' | 'green';

export function calculateHealthColor(
  healthValue: number,
  waiting: number,
  paused: number
): HealthColor {
  if (healthValue === 0) return 'dark';

  const double = healthValue * 2;
  const half = healthValue / 2;

  const hasReached = (value: number) =>
    waiting >= value || paused >= value;

  if (hasReached(double)) return 'purple';
  if (hasReached(healthValue)) return 'red';
  if (hasReached(half)) return 'yellow';

  return 'green';
}

export function calculateStatusColor(status: string): string {
  return status === 'running' ? 'green' : 'orange';
}

export function calculateActionColor(action: string): string {
  const actionColors: Record<string, string> = {
    pause: 'orange',
    resume: 'primary',
    delete: 'negative',
  };

  return actionColors[action] ?? 'white';
}

export function calculateProgress(
  healthValue: number,
  waiting: number,
  paused: number
): number {
  if (healthValue === 0) return 0;

  const double = healthValue * 2;
  const half = healthValue / 2;

  const hasReached = (value: number) =>
    waiting >= value || paused >= value;

  if (hasReached(double)) return 1;
  if (hasReached(healthValue)) return 0.75;
  if (hasReached(half)) return 0.5;

  return 0.25;
}
