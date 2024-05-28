import moment from 'moment';

export const timestampToDate = (timestamp?: number): string | undefined => (
  !timestamp ? undefined : moment(timestamp).format('YYYY-MM-DD HH:m:s')
);
