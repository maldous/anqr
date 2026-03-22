export class Logger {
  private destination: string;

  constructor(destination: string = "stdout") {
    this.destination = destination;
  }

  public log(message: string): void {
    if (this.destination === "stdout") {
      console.log(message);
    }
    // Add other destinations as needed
  }
}
