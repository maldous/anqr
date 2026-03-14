export interface QArtWorkerProgressMessage {
  type: 'progress';
  id: number;
  stage: string;
  percent: number;
}
