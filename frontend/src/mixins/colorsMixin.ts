
export default function colorsMixin() {
  function calculateHealthColor(
    healthValue: number,
    waiting: number,
    paused: number
  ): string {
    if (healthValue === 0) {
      return 'gray';
    }
    const double = healthValue * 2;
    if (waiting >= double || paused >= double) {
      return 'purple';
    }
    if (waiting >= healthValue || paused >= healthValue) {
      return 'red';
    }
    const half = healthValue / 2;
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
    healthValue: number,
    waiting: number,
    paused: number
  ): number {
    if (healthValue === 0) {
      return 0;
    }
    const double = healthValue * 2;
    if (waiting >= double || paused >= double) {
      return 1;
    }
    if (waiting >= healthValue || paused >= healthValue) {
      return 0.75;
    }
    const half = healthValue / 2;
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
