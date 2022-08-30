import { autobind } from "../decorators/autobind-decorator.js";
import { ProjectStatus } from "../enums/project-status-enum.js";
import { DragTarget } from "../models/drag-and-drop-interface.js";
import { projectState } from "../state/project-state.js";
import { BaseComponent } from "./base-component.js";
import { Project } from "./project.js";
import { ProjectItem } from "./project-item-component.js";

export class ListFactory extends BaseComponent<HTMLElement> implements DragTarget {
  constructor(private type: "active" | "closed") {
    super("project-list", "beforeend", `${type}-projects`);

    this.projectsList = [];
    projectState.addListener((projects: Project[]) => {
      this.projectsList = projects.filter((proj) => {
        if (this.type === "active") {
          return proj.status === ProjectStatus.Active;
        }
        return proj.status === ProjectStatus.Closed;
      });

      this.renderContent();
    });

    this.configure();
  }

  projectsList: Project[];

  renderContent() {
    const list = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    list.innerHTML = "";
    for (const prjItem of this.projectsList) {
      new ProjectItem(this.element.querySelector("ul")!.id, prjItem);
    }
  }

  @autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @autobind
  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer?.getData("text/plain")!;
    projectState.moveProject(
      projectId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Closed
    );
  }

  @autobind
  dragLeaveHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const ulElement = this.element.querySelector("ul");
      ulElement?.classList.remove("droppable");
    }
  }

  private configure() {
    const id = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = id;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
  }
}