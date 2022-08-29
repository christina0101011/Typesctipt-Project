interface FormControl {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

interface Draggable {
  dragStartHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

function validate(input: FormControl) {
  let isValid = true;
  if (input.required) {
    isValid = isValid && input.value.toString().trim().length !== 0;
  }
  if (input.minLength != null && typeof input.value === "string") {
    isValid = isValid && input.value.length >= input.minLength;
  }
  if (input.maxLength != null && typeof input.value === "string") {
    isValid = isValid && input.value.length <= input.maxLength;
  }
  if (input.min != null && typeof input.value === "number") {
    isValid = isValid && input.value >= input.min;
  }
  if (input.max != null && typeof input.value === "number") {
    isValid = isValid && input.value <= input.max;
  }

  return isValid;
}

function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const initialValue = descriptor.value;

  const adjustedValue: PropertyDescriptor = {
    get() {
      const boundFn = initialValue.bind(this);
      return boundFn;
    },
  };
  return adjustedValue;
}

enum ProjectStatus {
  Active,
  Closed,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public numOfPeople: number,
    public status: ProjectStatus
  ) {}
}

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

const projectState = ProjectState.preventDuplications();

abstract class BaseComponent<T extends HTMLElement> {
  constructor(
    private templateElementId: string,
    private insertPosition: InsertPosition,
    private newElementId?: string,
    private hostElementId?: string
  ) {
    this.hostElement = <HTMLDivElement>(
      document.getElementById(this.hostElementId || "app")!
    );
    this.templateElement = document.getElementById(
      this.templateElementId
    ) as HTMLTemplateElement;
    this.element = <T>(
      document.importNode(this.templateElement.content, true).firstElementChild
    );
    this.newElementId ? (this.element.id = this.newElementId) : null;

    this.attachNode(this.insertPosition);
  }

  hostElement: HTMLDivElement;
  templateElement: HTMLTemplateElement;
  element: T;

  private attachNode(placeToAdd: InsertPosition) {
    this.hostElement.insertAdjacentElement(placeToAdd, this.element);
  }

  abstract renderContent(): void;
}

class ProjectItem extends BaseComponent<HTMLLIElement> implements Draggable {
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

class ListFactory extends BaseComponent<HTMLElement> implements DragTarget {
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

class FormFactory extends BaseComponent<HTMLFormElement> {
  constructor() {
    super("project-input", "afterbegin", "user-input");

    this.titleElementInput = <HTMLInputElement>(
      this.element.querySelector("#title")
    );
    this.descriptionElementInput = <HTMLInputElement>(
      this.element.querySelector("#description")
    );
    this.peopleElementInput = <HTMLInputElement>(
      this.element.querySelector("#people")
    );

    this.renderContent();
  }

  titleElementInput: HTMLInputElement;
  descriptionElementInput: HTMLInputElement;
  peopleElementInput: HTMLInputElement;

  renderContent() {
    this.element.addEventListener("submit", this.updateForm);
  }

  private getUserinputs(): [string, string, number] | void {
    const enteredTitle = this.titleElementInput.value;
    const enteredDescription = this.descriptionElementInput.value;
    const enteredPeople = this.peopleElementInput.value;

    const titleValidatable: FormControl = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: FormControl = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: FormControl = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again!");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleElementInput.value = "";
    this.descriptionElementInput.value = "";
    this.peopleElementInput.value = "";
  }

  @autobind
  private updateForm(event: Event) {
    event.preventDefault();
    const getUserinputs = this.getUserinputs();

    if (Array.isArray(getUserinputs)) {
      const [title, desc, people] = getUserinputs;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }
}

new FormFactory();
new ListFactory("active");
new ListFactory("closed");
