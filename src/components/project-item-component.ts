import { autobind } from "../decorators/autobind-decorator";
import { Draggable } from "../models/drag-and-drop-interface";
import { BaseComponent } from "./base-component";
import { Project } from "./project";

export class ProjectItem extends BaseComponent<HTMLLIElement> implements Draggable {
  private project: Project;

  get persons() {
    if (this.project.numOfPeople === 1) {
      return "1 person";
    } else {
      return `${this.project.numOfPeople} people`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", "beforeend", project.id, hostId);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
  }

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons + " assigned";
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}
