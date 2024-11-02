import fs from "node:fs/promises";
import crypto from "node:crypto";

import Task from "models/task.js";

interface DatabaseSchema {
  tasks: Task[];
}

interface NewTask {
  title: string;
  description?: string;
}

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
  #database: DatabaseSchema = { tasks: [] };

  constructor() {
    fs.readFile(databasePath, "utf-8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => this.#persist());
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  list(): Task[] {
    const tasks = this.#database.tasks;

    return Array.isArray(tasks) ? tasks : [];
  }

  create(task: Pick<Task, "title" | "description">) {
    this.#database.tasks.push({
      id: crypto.randomUUID(),
      createdAt: new Date().toString(),
      completedAt: undefined,
      updatedAt: undefined,
      ...task,
    });

    this.#persist();
  }

  update(id: string, description: string) {
    const taskToUpdate = this.#database.tasks.find((task) => task.id === id);

    if (!taskToUpdate) return new Error("Task not founded!");

    taskToUpdate.description = description;
    taskToUpdate.updatedAt = new Date().toString();

    this.#persist();
  }

  complete(id: string) {
    const taskToComplete = this.#database.tasks.find((task) => task.id === id);

    if (!taskToComplete) return new Error("Task not founded!");

    taskToComplete.completedAt = new Date().toString();

    this.#persist();
  }

  delete(id: string) {
    this.#database.tasks.filter((task) => task.id !== id);

    this.#persist();
  }
}
