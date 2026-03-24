export class FakeQueueState {
  private items: Array<{ id: string; status: string; priority: number }> = [];

  enqueue(item: { id: string; priority: number }): void {
    this.items.push({ ...item, status: "pending" });
    this.items.sort((a, b) => b.priority - a.priority);
  }

  dequeue(): { id: string; status: string; priority: number } | undefined {
    return this.items.shift();
  }

  getItems(): Array<{ id: string; status: string; priority: number }> {
    return [...this.items];
  }

  getPendingCount(): number {
    return this.items.filter((i) => i.status === "pending").length;
  }

  complete(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.status = "completed";
    }
  }

  fail(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.status = "failed";
    }
  }

  clear(): void {
    this.items = [];
  }
}
