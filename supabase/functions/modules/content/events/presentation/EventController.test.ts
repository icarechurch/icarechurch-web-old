import { EventController } from "./EventController.ts";

Deno.test("EventController delegates each operation to its use case", async () => {
  const calls: unknown[][] = [];
  const events = [{ id: "event-1" }];
  const createdEvent = { id: "event-2" };
  const updatedEvent = { id: "event-1", title: "Updated" };
  const deletedId = "event-1";
  const createInput = { title: "Prayer Night" };
  const updateInput = { id: "event-1", title: "Updated" };
  const deleteInput = { id: "event-1" };
  const controller = new EventController(
    {
      async execute() {
        calls.push(["list"]);
        return events;
      },
    },
    {
      async execute(input: unknown) {
        calls.push(["create", input]);
        return createdEvent;
      },
    },
    {
      async execute(input: { id: string } & Record<string, unknown>) {
        calls.push(["update", input]);
        return updatedEvent;
      },
    },
    {
      async execute(input: { id: string }) {
        calls.push(["delete", input]);
        return deletedId;
      },
    },
  );

  const listResult = await controller.list();
  const createResult = await controller.create(createInput);
  const updateResult = await controller.update(updateInput);
  const deleteResult = await controller.delete(deleteInput);

  if (
    listResult !== events ||
    createResult !== createdEvent ||
    updateResult !== updatedEvent ||
    deleteResult !== deletedId
  ) {
    throw new Error("The controller changed a use-case result");
  }

  const expectedCalls = [
    ["list"],
    ["create", createInput],
    ["update", updateInput],
    ["delete", deleteInput],
  ];

  if (JSON.stringify(calls) !== JSON.stringify(expectedCalls)) {
    throw new Error("The controller did not delegate each event operation");
  }
});
