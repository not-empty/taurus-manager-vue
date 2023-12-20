interface ICreateQueueDTO {
  name: string;
  description?: string;
  compliance?: string;
  host: string;
  port: number;
  health_value: number;
  groupId: string;
}

export default ICreateQueueDTO;
