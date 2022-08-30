import { Project } from "../components/project.js";
import { ProjectStatus } from "../enums/project-status-enum.js";

type Listener<T> = (items: T[]) => void;

abstract class State<T> {
  constructor() {}

  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private static instance: ProjectState;
  private projects: Project[] = [];

  private constructor() {
    super();
  }

  static preventDuplications() {
    if (this.instance) {
      return this.instance;
    }
    return (this.instance = new ProjectState());
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.notifyListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    for (const fn of this.listeners) {
      fn(this.projects.slice());
    }
  }
}

export const projectState = ProjectState.preventDuplications();