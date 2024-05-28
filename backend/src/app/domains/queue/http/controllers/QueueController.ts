import { instanceToInstance } from 'class-transformer';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { JobState } from '../../../../providers/QueueProvider/types';
import CloneJobService from '../../../job/services/CloneJobService';
import CreateJobService from '../../../job/services/CreateJobService';
import DeleteJobService from '../../../job/services/DeleteJobService';
import ExportJobService from '../../../job/services/ExportJobService';
import ListJobService from '../../../job/services/ListJobService';
import RetryAllJobService from '../../../job/services/RetryAllJobService';
import RetryJobService from '../../../job/services/RetryJobService';
import ShowJobService from '../../../job/services/ShowJobService';
import CreateQueueService from '../../services/CreateQueueService';
import DeleteQueueService from '../../services/DeleteQueueService';
import ListQueueService from '../../services/ListQueueService';
import PauseQueueBulkService from '../../services/PauseQueueBulkService';
import PauseQueueService from '../../services/PauseQueueService';
import ResumeQueueBulkService from '../../services/ResumeQueueBulkService';
import ResumeQueueService from '../../services/ResumeQueueService';
import ShowQueueDashboardService from '../../services/ShowQueueDashboardService';
import ShowQueueService from '../../services/ShowQueueService';
import UpdateQueueService from '../../services/UpdateQueueService';

class QueueController {
  public async cloneJob(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { id: queueId, jobId } = request.params;
    const cloneJob = container.resolve(CloneJobService);
    const result = await cloneJob.execute({
      queueId,
      jobId,
    });
    return response.json(result);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const {
      name,
      description,
      compliance,
      host,
      port,
      healthValue,
      groupId,
    } = request.body;

    const createQueue = container.resolve(CreateQueueService);
    const queue = await createQueue.execute({
      name,
      description,
      compliance,
      host,
      port,
      healthValue,
      groupId,
    });
    return response.json(instanceToInstance(queue));
  }

  public async createJob(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { id: queueId } = request.params;
    const { data } = request.body;
    const createJob = container.resolve(CreateJobService);
    const result = await createJob.execute({
      queueId,
      data,
    });
    return response.json(result);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const deleteQueue = container.resolve(DeleteQueueService);
    const result = await deleteQueue.execute({
      id,
    });
    return response.json(result);
  }

  public async deleteJob(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { id: queueId } = request.params;
    const { jobIds } = request.body;
    const deleteJob = container.resolve(DeleteJobService);
    const result = await deleteJob.execute({
      queueId,
      jobIds,
    });
    return response.json(result);
  }

  public async exportJob(request: Request, response: Response): Promise<void> {
    const { queueId, jobId } = request.params;
    const { user } = request;
    const exportJob = container.resolve(ExportJobService);
    const { filename, content } = await exportJob.execute({
      queueId,
      jobId,
      user,
    });

    response.setHeader(
      'Content-disposition',
      `attachment; filename=${filename}`,
    );

    response.setHeader('Content-type', 'application/json');
    response.write(content, () => response.end());
  }

  public async list(request: Request, response: Response): Promise<Response> {
    const { page, size } = request.query;
    const listQueue = container.resolve(ListQueueService);
    const queues = await listQueue.execute({
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
    });
    return response.json(instanceToInstance(queues));
  }

  public async listJobs(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { id: queueId } = request.params;
    const { state, page, size } = request.query;
    const listJob = container.resolve(ListJobService);
    const result = await listJob.execute({
      queueId,
      state: state as JobState,
      page: Number(page),
      size: Number(size),
    });
    return response.json(result);
  }

  public async pause(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const pauseQueue = container.resolve(PauseQueueService);
    const result = await pauseQueue.execute({
      id,
    });
    return response.json(result);
  }

  public async pauseBulk(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { ids } = request.body;
    const pauseQueueBulk = container.resolve(PauseQueueBulkService);
    const result = await pauseQueueBulk.execute({
      ids,
    });
    return response.json(result);
  }

  public async resume(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const resumeQueue = container.resolve(ResumeQueueService);
    const result = await resumeQueue.execute({
      id,
    });
    return response.json(result);
  }

  public async resumeBulk(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { ids } = request.body;
    const resumeQueueBulk = container.resolve(ResumeQueueBulkService);
    const result = await resumeQueueBulk.execute({
      ids,
    });
    return response.json(result);
  }

  public async retryJobs(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { id: queueId } = request.params;
    const { jobIds } = request.body;
    const retryJob = container.resolve(RetryJobService);
    const result = await retryJob.execute({
      queueId,
      jobIds,
    });
    return response.json(result);
  }

  public async retryAllJobs(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { id: queueId } = request.params;
    const retryAllJob = container.resolve(RetryAllJobService);
    const result = await retryAllJob.execute({
      queueId,
    });
    return response.json(result);
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const showQueue = container.resolve(ShowQueueService);
    const queue = await showQueue.execute({
      id,
    });
    return response.json(instanceToInstance(queue));
  }

  public async showDashboard(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { id } = request.params;
    const showQueueDashboard = container.resolve(ShowQueueDashboardService);
    const queueDashboard = await showQueueDashboard.execute({
      id,
    });
    return response.json(queueDashboard);
  }

  public async showJob(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { queueId, jobId } = request.params;
    const showJob = container.resolve(ShowJobService);
    const job = await showJob.execute({
      queueId,
      jobId,
    });
    return response.json(job);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const {
      name,
      description,
      compliance,
      host,
      port,
      healthValue,
      groupId,
    } = request.body;

    const updateQueue = container.resolve(UpdateQueueService);
    const queue = await updateQueue.execute({
      id,
      name,
      description,
      compliance,
      host,
      port,
      healthValue,
      groupId,
    });
    return response.json(instanceToInstance(queue));
  }
}

export default QueueController;
