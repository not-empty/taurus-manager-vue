
export default function colorsMixin() {
  function calculateHealthColor(
    health_value: number,
    waiting: number,
    paused: number
  ): string {
    if (health_value === 0) {
      return 'gray';
    }
    const double = health_value * 2;
    if (waiting >= double || paused >= double) {
      return 'purple';
    }
    if (waiting >= health_value || paused >= health_value) {
      return 'red';
    }
    const half = health_value / 2;
    if (waiting >= half || paused >= half) {
      return 'orange';
    }
    return 'green';
  }

  function calculateStatusColor(status: string): string {
    if (status === 'running') {
      return 'primary';
    }
    return 'orange';
  }

  function calculateActionColor(action: string): string {
    if (action === 'pause') {
      return 'orange';
    }
    if (action === 'resume') {
      return 'primary';
    }
    if (action === 'delete') {
      return 'negative';
    }
    return 'white';
  }

  function calculateProgress(
    health_value: number,
    waiting: number,
    paused: number
  ): number {
    if (health_value === 0) {
      return 0;
    }
    const double = health_value * 2;
    if (waiting >= double || paused >= double) {
      return 1;
    }
    if (waiting >= health_value || paused >= health_value) {
      return 0.75;
    }
    const half = health_value / 2;
    if (waiting >= half || paused >= half) {
      return 0.5;
    }
    return 0.25;
  }

  return {
    calculateHealthColor,
    calculateStatusColor,
    calculateActionColor,
    calculateProgress,
  }
}
