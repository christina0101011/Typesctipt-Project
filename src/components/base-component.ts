export abstract class BaseComponent<T extends HTMLElement> {
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
