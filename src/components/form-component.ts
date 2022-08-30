import { autobind } from "../decorators/autobind-decorator.js";
import { FormControl } from "../models/form-control-interface.js";
import { projectState } from "../state/project-state.js";
import { validate } from "../utils/validation.js";
import { BaseComponent } from "./base-component.js";

export class FormFactory extends BaseComponent<HTMLFormElement> {
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
