import { instanceToInstance } from "class-transformer";
import { Request, Response } from "express";
import { container } from "tsyringe";
import CreateGroupService from "../../services/CreateGroupService";
import DeleteGroupService from "../../services/DeleteGroupService";
import ListGroupDashboardService from "../../services/ListGroupDashboardService";
import ListGroupMonitorService from "../../services/ListGroupMonitorService";
import ListGroupService from "../../services/ListGroupService";
import ShowGroupDashboardService from "../../services/ShowGroupDashboardService";
import ShowGroupService from "../../services/ShowGroupService";
import UpdateGroupService from "../../services/UpdateGroupService";

class GroupController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, description } = request.body;
    const createGroup = container.resolve(CreateGroupService);
    const group = await createGroup.execute({
      name,
      description,
    });
    return response.json(instanceToInstance(group));
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const deleteGroup = container.resolve(DeleteGroupService);
    const result = await deleteGroup.execute(String(id));
    return response.json(result);
  }

  public async list(request: Request, response: Response): Promise<Response> {
    const { page, size } = request.query;
    const listGroup = container.resolve(ListGroupService);
    const groups = await listGroup.execute({
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
    });
    return response.json(groups);
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const showGroup = container.resolve(ShowGroupService);
    const group = await showGroup.execute(String(id));
    return response.json(instanceToInstance(group));
  }

  public async listDashboard(
    request: Request,
    response: Response
  ): Promise<Response> {
    const { user } = request;
    const listGroupDashboard = container.resolve(ListGroupDashboardService);
    const groupDashboards = await listGroupDashboard.execute({
      user,
    });
    return response.json(groupDashboards);
  }

  public async listMonitor(
    request: Request,
    response: Response
  ): Promise<Response> {
    const { user } = request;
    const listGroupMonitor = container.resolve(ListGroupMonitorService);
    const groupDashboards = await listGroupMonitor.execute({
      user,
    });
    return response.json(groupDashboards);
  }

  public async showDashboard(
    request: Request,
    response: Response
  ): Promise<Response> {
    const { id } = request.params;
    const { user } = request;
    const showGroupDashboard = container.resolve(ShowGroupDashboardService);
    const groupDashboard = await showGroupDashboard.execute({
      groupId: id,
      user,
    });
    return response.json(groupDashboard);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { name, description } = request.body;
    const updateGroup = container.resolve(UpdateGroupService);
    const group = await updateGroup.execute({
      id: String(id),
      name,
      description,
    });
    return response.json(instanceToInstance(group));
  }
}

export default GroupController;
