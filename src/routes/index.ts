import { FastifyInstance } from "fastify";

import { Database } from "database/index.js";
import { string, z } from "zod";
import { pipeline } from "node:stream/promises";
import { parse } from "csv-parse";
import { AppError } from "errors/AppError.js";

async function TaskRoutes(app: FastifyInstance) {
  const db = new Database();

  app.get("/tasks", (_, reply) => {
    const tasks = db.list();

    reply.status(200).send({
      tasks,
    });
  });

  app.post("/tasks", (request, reply) => {
    const createTaskSchema = z.object({
      title: z.string().min(1, "Task title is required"),
      description: z.string().optional(),
    });

    const newTask = createTaskSchema.parse(request.body);

    db.create(newTask);

    reply.status(201).send();
  });

  app.post("/tasks/upload", async (request, reply) => {
    const upload = await request.file();

    if (!upload) {
      throw new AppError("Nenhum arquivo foi enviado.", 400);
    }

    if (upload.mimetype !== "text/csv") {
      throw new AppError(
        "Formato de arquivo inválido. Envie apenas arquivos CSV (.csv)",
        400
      );
    }

    const parser = parse({
      delimiter: ",",
      columns: true,
      skipEmptyLines: true,
    });

    try {
      await pipeline(upload.file, parser, async function* (source) {
        for await (const chunk of source) {
          const task = {
            title: chunk.title,
            description: chunk.description,
          };

          if (!task.title) {
            continue;
          }

          db.create(task);
        }
      });

      reply.status(201).send();
    } catch (error) {
      throw new AppError("Erro ao processar o arquivo CSV", 500);
    }
  });

  app.put("/tasks/:id", (request, reply) => {
    const updateTaskBodyChema = z.object({
      description: z.string({ message: "Invalid description" }),
    });

    const updateParamsSchema = z.object({
      id: string(),
    });

    const { id: taskId } = updateParamsSchema.parse(request.params);
    const { description } = updateTaskBodyChema.parse(request.body);

    db.update(taskId, description);

    reply.status(204).send();
  });

  app.patch("/tasks/:id/complete", (request, reply) => {
    const completeTaskParamsSchema = z.object({
      id: z.string().uuid("ID inválido"),
    });

    const { id: taskId } = completeTaskParamsSchema.parse(request.params);

    db.complete(taskId);

    reply.status(204).send();
  });

  app.delete("/tasks/:id", (request, reply) => {
    const deleteTaskParamsSchema = z.object({
      id: z.string().uuid("Invalid task ID format"),
    });

    const { id } = deleteTaskParamsSchema.parse(request.params);

    db.delete(id);

    reply.status(204).send();
  });
}

export default TaskRoutes;
