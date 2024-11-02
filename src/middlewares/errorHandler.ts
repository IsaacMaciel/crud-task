import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      status: "validation_error",
      message: "Erro de validação",
      issues: error.format(),
    });
  }

  request.log.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      path: request.url,
      method: request.method,
    },
  });

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      status: "error",
      message: error.message,
    });
  }

  request.log.error({
    error: "Erro interno não tratado",
    details: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
  });

  return reply.status(500).send({
    status: "error",
    message: "Erro interno do servidor",
  });
}
